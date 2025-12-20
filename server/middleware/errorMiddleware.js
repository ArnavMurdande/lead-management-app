// server/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Clone the error object to modify it without affecting the original
  let error = { ...err };
  error.message = err.message;

  // --- Mongoose Error Handling ---

  // 1. Mongoose Bad ObjectId (CastError)
  // e.g., fetching /api/leads/invalid-id
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    res.status(404);
    error = { message };
  }

  // 2. Mongoose Duplicate Key (code 11000)
  // e.g., registering with an email that already exists
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    res.status(400);
    error = { message };
  }

  // 3. Mongoose Validation Error
  // e.g., missing required fields like 'email'
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    res.status(400);
    error = { message };
  }

  // --- Send Response ---
  res.status(statusCode !== 200 ? statusCode : 500).json({
    message: error.message || err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };