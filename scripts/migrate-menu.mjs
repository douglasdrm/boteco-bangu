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

function sourceImagePath(url) {
    if (!url?.startsWith(source + publicPath)) return null;
    return decodeURIComponent(new URL(url).pathname.slice(publicPath.length));
}

const [items, settings] = await Promise.all([
    readTable('menu_items', 'id'), readTable('configuracoes_cardapio', 'chave')
]);

// Inventário do bucket menu-images para copiar também as fotos sem prato vinculado.
const inventory = [
    "menu/1777039541836-linguica-com-pao.png",
    "menu/1777040507171-linguica-com-pao.png",
    "menu/1777043811564-coracao.png",
    "menu/1777044359906-contra-fritas.png",
    "menu/1777055305801-chiclete.png",
    "menu/1777055336457-cachorras.png",
    "menu/1777055357833-bolinho-de-bacalhau.png",
    "menu/1777055394681-frango.png",
    "menu/1777055424848-hamburg.png",
    "menu/1777055447128-presunto-parma.png",
    "menu/1777055476131-rabada.png",
    "menu/1778096251312-torresmo.png",
    "menu/1778096267636-picanha.png",
    "menu/1780406037164-refrigerante-coca-cola-original-garrafa-retorn-vel-290ml-2844a503-444d-43d3-b8ab-0714ca274ed9.png",
    "menu/1780406291376-refrigerante-coca-cola-original-garrafa-retorn-vel-290ml-2844a503-444d-43d3-b8ab-0714ca274ed9.png",
    "menu/1780406448181-l-2f86b305295c4e11a722bc5bf75948e2.webp",
    "menu/1780412888191-small-prod-150304008-p1-57d47e0c1c.webp",
    "menu/1780413052257-7894900660302.png",
    "menu/1780413103534-nectar-maracuja-del-valle-lata-290ml.png",
    "menu/1780413162891-11570-sexy-fish-malbec-semsafra-66f33f7295ab7-md.png",
    "menu/1780413204457-23129-2025-abr-estelar57-cabsauv-png.png",
    "menu/1780416547821-349242-png-cropped.webp",
    "menu/1780416579641-refrigerante-coca-cola-original-garrafa-retorn-vel-290ml-2844a503-444d-43d3-b8ab-0714ca274ed9-cropped.png",
    "menu/1780425169886-v-arg-norton-porteno-chardonnay-2024-cropped.png",
    "menu/1780425574138-v-port-reguengos-tt-alent-2023-cropped.png",
    "menu/1780425637465-23021-2025-fev-produto-carolina-r-carmenere-png-cropped.png",
    "menu/1780425694711-v-port-pardalito-verde-branco-doc-cropped.png",
    "menu/1780425756997-158828-800-auto-uny38hcubf-cropped.webp",
    "menu/1780425806371-511441-v-port-pouca-roupa-tt-750ml-cropped.png",
    "menu/1780425870591-v-arg-alfredo-alma-inquieta-blend-cropped.png",
    "menu/1780426049468-cerveja-estrella-galicia-zero-lcool-lata-330ml-cropped.png",
    "menu/1780426109451-sku-600x600-1ultra-garrafa-cropped.webp",
    "menu/1780426183766-11061-heineken-long-neck-330ml-zero-24un-20251023120115-cropped.png",
    "menu/1780426363006-11061-heineken-long-neck-330ml-zero-24un-20251023120115-cropped.png",
    "menu/1780426444515-3328-heineken-long-neck-330ml-normal-24un-20251201102027-cropped.png",
    "menu/1780426491413-19900000002462-7898367983615-248825-1-cropped.webp",
    "menu/1780426556165-7896371000182-cropped.png",
    "menu/1780426598439-7898953990010-cropped.png",
    "menu/1780426649707-sku-600x600-1garrafa-600-cropped.webp",
    "menu/1780427153306-638e8422-2272-4b4f-a02a-941df6aefb63-cropped.webp",
    "menu/1780427203192-33340167-cropped.png",
    "menu/1780427249664-cerveja-alem-paulaner-weissbier-dunkel-500ml-cerealista-express-png-cropped.webp",
    "menu/1784234293039-166156-800-auto-cropped.png",
    "menu/1784234507958-11576-2025-abr-porteno-cabernetsauvignon-png-cropped.png",
    "menu/1784234835529-vecteezy-wine-glass-png-with-ai-generated-26772956-cropped.png",
    "menu/1784235124433-home-bloco-2-pr-rubine-3-cropped.webp",
    "menu/1784311643859-vecteezy-wine-glass-png-with-ai-generated-26772956-cropped.png",
    "menu/1785354736084-406-cerveja-antarctica-original-600-ml-cropped.png",
    "menu/1785354836814-spaten-puro-malte-600ml-cropped.png",
    "menu/1785355024597-cerveja-corona-extra-long-neck-330ml-cropped.png",
    "menu/1785355097343-db22ba2f37e858e095b619cddbb20b55-cropped.webp",
    "menu/1785355168480-sem-gluten-longneck-cropped.png",
    "menu/1785355230454-cerveja-corona-extra-long-neck-330ml-cropped.png"
];
const images = [...new Set([...inventory, ...items.map(item => sourceImagePath(item.imagem_url)).filter(Boolean)])];
console.log(`Origem: ${items.length} pratos, ${settings.length} configurações, ${images.length} arquivos.`);
if (!items.length) throw new Error('O cardápio de origem está vazio.');
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
