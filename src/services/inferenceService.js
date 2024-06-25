const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const loadModel = require('./loadModel');

const predict = async (file) => {
    const model = await loadModel.getModel();
    const buffer = await file.toBuffer();
    const imageTensor = tf.node.decodeImage(buffer);
    const prediction = model.predict(imageTensor.expandDims(0));
    const result = (prediction.dataSync()[0] > 0.5) ? 'Cancer' : 'Non-cancer';
    const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Anda sehat!';
    const createdAt = new Date().toISOString();

    return { result, suggestion, createdAt };
};

module.exports = {
    predict
};
