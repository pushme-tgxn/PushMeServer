require("dotenv").config();

const app = require("./src/app.js");

const { appLogger } = require("./src/middleware/logging.js");

const PORT_NUMBER = process.env.PORT || 3000;

app.listen(PORT_NUMBER, () => {
  appLogger.info(`Server Online on Port ${PORT_NUMBER}`);
});
