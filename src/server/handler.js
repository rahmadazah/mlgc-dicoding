const { getModel } = require('../services/loadModel');
const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});
const db = admin.firestore();

const handlePredict = async (request, h) => {
    try {
        const file = request.payload.image;
        if (!file) {
            throw new InputError('No file uploaded');
        }

        const contentType = file.hapi.headers['content-type'];
        if (!contentType.startsWith('image/')) {
            throw new InputError('Unsupported Media Type');
        }

        const buffer = await file._data;
        if (buffer.length > 1000000) {
            return h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000'
            }).code(413);
        }

        const imageTensor = tf.node.decodeImage(buffer, 3).resizeNearestNeighbor([224, 224]).expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

        const model = getModel();
        if (!model) {
            console.error('Model is not loaded');
            throw new Error('Model is not loaded');
        }

        const prediction = model.predict(imageTensor);
        const confidenceScore = prediction.dataSync()[0];
        const result = confidenceScore > 0.5 ? 'Cancer' : 'Non-cancer';
        const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Anda sehat!';
        const createdAt = new Date().toISOString();

        const id = new Date().toISOString();
        await db.collection('predictions').doc(id).set({
            id,
            result,
            suggestion,
            confidenceScore,
            createdAt
        });

        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data: {
                id,
                result,
                suggestion,
                createdAt
            }
        }).code(201);
    } catch (error) {
        console.error('Error in handlePredict:', error);
        if (error instanceof InputError) {
            return h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi'
            }).code(400);
        }

        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        }).code(500);
    }
};

const handleGetHistories = async (request, h) => {
    try {
        const snapshot = await db.collection('predictions').get();
        const histories = snapshot.docs.map(doc => ({ id: doc.id, history: doc.data() }));
        return h.response({
            status: 'success',
            data: histories
        }).code(200);
    } catch (error) {
        console.error('Error in handleGetHistories:', error);
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam mengambil data riwayat'
        }).code(500);
    }
};

module.exports = {
    handlePredict,
    handleGetHistories
};
