module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  switch (true) {
    case typeof err === "string":
      // custom application error
      const is404 = err.toLowerCase().endsWith("not found");
      const statusCode = is404 ? 404 : 400;
      return res.status(statusCode).json({ success: false, message: err });
    case err.name === "UnauthorizedError":
      // jwt authentication error
      return res.status(401).json({ success: false, message: "Unauthorized" });
    default:
      return res.status(500).json({ success: false, message: err.toString() });
  }
}
