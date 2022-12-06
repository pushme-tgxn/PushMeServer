const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/error-handler");

const routes = require("./routes");

const app = express();

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

// global error handler last
app.use(errorHandler);

module.exports = app;
