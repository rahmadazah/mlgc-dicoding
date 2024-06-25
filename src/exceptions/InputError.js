const ClientError = require("../exceptions/ClientError");
 
class InputError extends ClientError {
    constructor(message, errorCode = 400) {
    super(message, errorCode);
    this.name = 'InputError';
  }
}
 
module.exports = InputError;