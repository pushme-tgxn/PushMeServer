const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

const TokenRouter = require("./routes/token.js");
const PushRouter = require("./routes/push.js");
// const UserRouter = require("./routes/user.js");

router.get("/", async (request, response) => {
  console.log("Push Notification Server Running");
  response.sendFile(__dirname + "/views/index.html");
});

router.use("/token", TokenRouter);
// router.use("/user", UserRouter);
router.use("/push", PushRouter);

module.exports = router;
