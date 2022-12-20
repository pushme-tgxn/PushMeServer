const winston = require("winston");

const consoleTransport = new winston.transports.Console();
const defaultTransports = {
  transports: [consoleTransport],
};

winston.addColors({
  debug: "grey",
  info: "green",
  warn: "yellow",
  error: "red",
});

const level = process.env.LOG_LEVEL || "debug";

function createAppLogger() {
  const requestLogger = winston.createLogger({
    level,
    format: getAppLogFormatter(),
    defaultMeta: { service: "app" },
    ...defaultTransports,
  });

  return {
    log: (message, ...extra) => requestLogger.info(message, { ...extra }),
    info: (message, service) => requestLogger.info(message, { service }),
    error: (message, service) => requestLogger.error(message, { service }),
    warn: (message, service) => requestLogger.warn(message, { service }),
    debug: (message, service) => requestLogger.debug(message, { service }),
  };
}

function getAppLogFormatter() {
  const colorizer = winston.format.colorize();

  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.printf((info) => {
      const colorPrefix = colorizer.colorize(
        info.level,
        `${info.timestamp} ${info.level}`
      );
      if (info.service && info.service !== "app") {
        // app is the default service
        return `${colorPrefix}: [${info.service}] ${info.message}`;
      }
      return `${colorPrefix}: ${info.message}`;
    })
  );
}

function createRequestLogger() {
  const requestLogger = winston.createLogger({
    level,
    format: getRequestLogFormatter(),
    defaultMeta: { service: "request" },
    ...defaultTransports,
  });

  return function logRequest(req, res, next) {
    requestLogger.debug({ req, res });
    next();
  };
}

function getRequestLogFormatter() {
  const { combine, colorize, timestamp, printf } = winston.format;
  const colorizer = colorize();

  return combine(
    timestamp(),
    printf((info) => {
      const { req, res } = info.message;
      const colorPrefix = colorizer.colorize(
        info.level,
        `${info.timestamp} ${info.level} ${req.path}`
      );
      return `${colorPrefix} ${req.method}`;
    })
  );
}

function createErrorLogger() {
  const errLogger = winston.createLogger({
    level,
    format: getErrorLogFormatter(),
    defaultMeta: { service: "error" },
    ...defaultTransports,
  });

  return function logError(err, req, res, next) {
    errLogger.error({ err, req, res });
    next(err);
  };
}

function getErrorLogFormatter() {
  const { combine, colorize, timestamp, printf } = winston.format;
  const colorizer = colorize();

  return combine(
    timestamp(),
    printf((info) => {
      const { req, res, err } = info.message;
      const colorPrefix = colorizer.colorize(
        info.level,
        `${info.timestamp} ${info.level} ${req.path}`
      );
      return `${colorPrefix} ${info.level}: ${err}`;
    })
  );
}

module.exports = {
  appLogger: createAppLogger(),
  requestLogger: createRequestLogger(),
  errorLogger: createErrorLogger(),
};
