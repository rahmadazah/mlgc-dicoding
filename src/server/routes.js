const { handlePredict, handleGetHistories } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/predict',
        handler: handlePredict,
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 1000000,
                multipart: true
            }
        }
    },
    {
        method: 'GET',
        path: '/predict/histories',
        handler: handleGetHistories
    }
];

module.exports = routes;
