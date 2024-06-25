require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { loadModel } = require('../services/loadModel'); // Corrected import
const ClientError = require('../exceptions/ClientError');
const InputError = require('../exceptions/InputError');

(async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },
  });

  const model = await loadModel(); // Ensure this line correctly calls loadModel
  server.app.model = model;

  server.route(routes);

  server.ext('onPreResponse', function (request, h) {
    const response = request.response;

    if (response instanceof InputError || response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
})();
