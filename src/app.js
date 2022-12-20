const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/error-handler");
const { requestLogger, errorLogger } = require("./middleware/logging");

const routes = require("./routes");

const app = express();

// express request logging middleware
app.use(requestLogger);

app.use(cors());
app.use(express.static("public"));

// support json and urlencoded values
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};
app.use(express.json({ verify: rawBodySaver }));
app.use(express.urlencoded({ verify: rawBodySaver, extended: true }));

// setup normal routes
app.use("/", routes);

// express error logging middleware
app.use(errorLogger);

// global error handler last
app.use(errorHandler);

module.exports = app;
