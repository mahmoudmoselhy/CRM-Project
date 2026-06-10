// Custom error with HTTP status code, e.g. throw new ApiError(404, 'Lead not found')
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
