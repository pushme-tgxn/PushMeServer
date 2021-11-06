const express = require("express");

const router = express.Router();

const TokenRouter = require("./routes/token.js");
const PushRouter = require("./routes/push.js");
const UserRouter = require("./routes/user.js");
const WebhookRouter = require("./routes/webhook.js");

router.get("/", async (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

router.use("/user", UserRouter);
router.use("/token", TokenRouter);
router.use("/push", PushRouter);
router.use("/webhook", WebhookRouter);

module.exports = router;
