require("dotenv").config();

const app = require("./app.js");

const PORT_NUMBER = process.env.PORT || 3000;

app.listen(PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});
