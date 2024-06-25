const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

let model;

const loadModel = async () => {
    if (!model) {
        try {
            const modelUrl = process.env.MODEL_URL;
            if (!modelUrl) {
                throw new Error('MODEL_URL is not defined');
            }
            console.log('Loading model from URL:', modelUrl);
            model = await tf.loadGraphModel(modelUrl);
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }
    return model;
};

const getModel = () => model;

module.exports = {
    loadModel,
    getModel
};
