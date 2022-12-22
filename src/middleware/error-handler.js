module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // custom application error
  if (typeof err === "string") {
    return res.status(400).json({ success: false, message: err });
  }

  // jwt authentication error
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ success: false, message: "unauthorized" });
  }

  // default to 500 server error
  return res.status(500).json({ success: false, message: err.toString() });
}
