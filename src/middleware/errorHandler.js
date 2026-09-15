const createErrorResponse = (res, statusCode, message, errors = []) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

const notFoundHandler = (req, res) => {
  createErrorResponse(res, 404, 'Resource not found');
};

const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    return createErrorResponse(res, 400, 'Validation failed', errors);
  }

  if (err.name === 'CastError') {
    return createErrorResponse(res, 400, 'Invalid ID format');
  }

  if (err.name === 'UnauthorizedError' || err.statusCode === 401) {
    return createErrorResponse(res, 401, 'Unauthorized access');
  }

  if (err.statusCode === 404) {
    return createErrorResponse(res, 404, err.message || 'Resource not found');
  }

  console.error(err);
  return createErrorResponse(res, 500, 'Internal server error');
};

module.exports = { notFoundHandler, errorHandler };
