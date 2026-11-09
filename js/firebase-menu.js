let firebaseMenuConnection;

function connectFirebaseMenu() {
    firebaseMenuConnection ??= (async () => {
        if (!window.botecoFirebaseConfig?.projectId) {
            throw new Error('O projeto Firebase do Boteco ainda não foi configurado.');
        }
        const sdk = 'https://www.gstatic.com/firebasejs/12.5.0';
        const [{ initializeApp }, dbSdk] = await Promise.all([
            import(sdk + '/firebase-app.js'),
            import(sdk + '/firebase-firestore.js')
        ]);
        const app = initializeApp(window.botecoFirebaseConfig);
        const db = dbSdk.getFirestore(app);
        const { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc,
            deleteDoc, writeBatch, runTransaction } = dbSdk;
        const item = id => doc(db, 'menu_items', String(id));
        const config = key => doc(db, 'configuracoes_cardapio', key);

        return {
            async items(publicOnly = false) {
                const items = collection(db, 'menu_items');
                const snapshot = await getDocs(publicOnly ? query(items, where('disponivel', '==', true)) : items);
                return snapshot.docs.map(row => row.data());
            },
            async config(key) {
                return (await getDoc(config(key))).data();
            },
            setConfig(key, data) { return setDoc(config(key), data); },
            update(id, data) { return updateDoc(item(id), data); },
            remove(id) { return deleteDoc(item(id)); },
            async insert(data) {
                const id = Date.now() * 1000 + crypto.getRandomValues(new Uint16Array(1))[0] % 1000;
                await runTransaction(db, async transaction => {
                    if ((await transaction.get(item(id))).exists()) {
                        throw new Error('Conflito ao cadastrar prato. Tente salvar novamente.');
                    }
                    transaction.set(item(id), { ...data, id });
                });
            },
            async updateItems(changes) {
                const batch = writeBatch(db);
                for (const { id, ...data } of changes) batch.update(item(id), data);
                await batch.commit();
            },
            async adminAuth(onChange, onError) {
                const { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } =
                    await import(sdk + '/firebase-auth.js');
                const auth = getAuth(app);
                onAuthStateChanged(auth, async user => {
                    try {
                        const allowed = user && (await getDoc(doc(db, 'administradores', user.uid))).exists();
                        if (auth.currentUser === user) onChange(user, !!allowed);
                    } catch (error) {
                        onError(error);
                    }
                });
                return {
                    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
                    signOut: () => signOut(auth)
                };
            }
        };
    })();
    return firebaseMenuConnection;
}
