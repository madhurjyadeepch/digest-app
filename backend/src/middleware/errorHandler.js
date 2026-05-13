/**
 * Global error handler middleware.
 * Catches all unhandled errors from route handlers.
 */
function errorHandler(err, _req, res, _next) {
  console.error('─── Unhandled Error ───');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('───────────────────────');

  // Axios errors (from external API calls)
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || 'External API error';

    return res.status(status >= 500 ? 502 : status).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Validation / client errors
  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

module.exports = { errorHandler };
