const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/error-handler");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.static("public"));

app.use(express.json());
app.use("/", routes);

// global error handler
app.use(errorHandler);

module.exports = app;
