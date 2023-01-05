module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // UnauthorizedError is thrown from express-jwt
  // https://github.com/auth0/express-jwt/blob/0000a44ed58aac97798007af19b0324f28acc436/README.md#error-handling
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ success: false, message: "unauthorized" });
  }

  // custom application errors
  if (typeof err === "string") {
    return res.status(400).json({ success: false, message: err });
  }

  // default to 500 server error
  return res.status(500).json({ success: false, message: err.toString() });
}
