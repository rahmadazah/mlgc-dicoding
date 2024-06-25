const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

const savePrediction = async (result) => {
    const id = new Date().toISOString();
    await db.collection('predictions').doc(id).set({
        id,
        ...result
    });
    return id;
};

const getHistories = async () => {
    const snapshot = await db.collection('predictions').get();
    return snapshot.docs.map(doc => ({ id: doc.id, history: doc.data() }));
};

module.exports = {
    savePrediction,
    getHistories
};
