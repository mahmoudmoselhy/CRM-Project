// Global error handler - must be the last middleware in app.js
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.statusCode ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
