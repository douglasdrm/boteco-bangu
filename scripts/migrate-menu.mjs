import { mkdir, readFile, writeFile } from 'node:fs/promises';

const legacyConfig = await readFile(new URL('../js/supabase-config.js', import.meta.url), 'utf8');
const SUPABASE_URL = process.env.SUPABASE_URL || legacyConfig.match(/const SUPABASE_URL = "([^"]+)"/)?.[1];
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || legacyConfig.match(/const SUPABASE_ANON_KEY = "([^"]+)"/)?.[1];
const FIREBASE_PROJECT_ID = 'boteco-bangu';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Configuração de origem ausente.');

const source = new URL(SUPABASE_URL).origin;
const headers = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
const publicPath = '/storage/v1/object/public/menu-images/';

async function read(url, options) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} em ${new URL(url).pathname}`);
    return response;
}

async function readTable(name, order) {
    const records = [];
    for (let offset = 0; ; offset += 200) {
        const page = await (await read(`${source}/rest/v1/${name}?select=*&order=${order}&limit=200&offset=${offset}`, { headers })).json();
        records.push(...page);
        if (page.length < 200) return records;
    }
}

async function listImages(prefix = '') {
    const names = [];
    for (let offset = 0; ; offset += 100) {
        const page = await (await read(`${source}/storage/v1/object/list/menu-images`, {
            method: 'POST', headers,
            body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } })
        })).json();
        for (const entry of page) {
            const path = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.id) names.push(path);
            else names.push(...await listImages(path));
        }
        if (page.length < 100) return names;
    }
}

function sourceImagePath(url) {
    if (!url?.startsWith(source + publicPath)) return null;
    return decodeURIComponent(new URL(url).pathname.slice(publicPath.length));
}

const [items, settings, images] = await Promise.all([
    readTable('menu_items', 'id'), readTable('configuracoes_cardapio', 'chave'), listImages()
]);
console.log(`Origem: ${items.length} pratos, ${settings.length} configurações, ${images.length} arquivos.`);
if (!items.length) throw new Error('O cardápio de origem está vazio.');
for (const item of items) {
    const path = sourceImagePath(item.imagem_url);
    if (path && !images.includes(path)) throw new Error(`Foto ausente no Supabase para o item ${item.id}: ${path}`);
}
const apply = process.argv.includes('--apply');
if (!apply && !process.argv.includes('--export-photos')) {
    console.log('Somente inventário. Use --export-photos para copiar as fotos ou --apply para importar os dados também.');
    process.exit(0);
}

const imageUrls = new Map();
const encodePath = path => path.split('/').map(encodeURIComponent).join('/');
for (const path of images) {
    const segments = path.split('/');
    if (segments.some(part => !part || part === '.' || part === '..' || /[\\:%]/.test(part))) {
        throw new Error(`Caminho de imagem inválido: ${path}`);
    }
    const response = await read(source + publicPath + encodePath(path));
    const destination = new URL(`../assets/img/menu/${encodePath(path)}`, import.meta.url);
    await mkdir(new URL('.', destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    imageUrls.set(path, '/assets/img/menu/' + encodePath(path));
}
console.log(`${imageUrls.size} fotos copiadas para assets/img/menu/.`);
if (!apply) process.exit(0);

const { initializeApp, applicationDefault } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
const db = getFirestore(initializeApp({ credential: applicationDefault(), projectId: FIREBASE_PROJECT_ID }));
if (!(await db.collection('menu_items').limit(1).get()).empty) {
    throw new Error('O destino já tem itens. Use um projeto novo para evitar sobrescrever alterações.');
}
if (items.length + settings.length > 500) throw new Error('Mais de 500 registros: divida a importação antes de gravar.');
const batch = db.batch();
for (const item of items) {
    const path = sourceImagePath(item.imagem_url);
    batch.create(db.collection('menu_items').doc(String(item.id)), {
        ...item, imagem_url: path ? imageUrls.get(path) : item.imagem_url
    });
}
for (const { chave, ...setting } of settings) {
    batch.create(db.collection('configuracoes_cardapio').doc(chave), setting);
}
await batch.commit();
console.log(`Importação concluída: ${items.length} pratos e ${imageUrls.size} arquivos.`);
