const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack || err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.type === "entity.parse.failed"
      ? "Invalid JSON request body"
      : statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed";

  return res.status(statusCode).json({ message });
};

module.exports = errorHandler;