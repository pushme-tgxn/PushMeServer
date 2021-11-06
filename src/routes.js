const express = require("express");

const router = express.Router();

const TokenRouter = require("./routes/token.js");
const PushRouter = require("./routes/push.js");
const UserRouter = require("./routes/user.js");
const WebhookRouter = require("./routes/webhook.js");

const GoogleAuthRouter = require("./routes/auth/google.js");

router.get("/", async (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

router.use("/user", UserRouter);
router.use("/token", TokenRouter);
router.use("/push", PushRouter);
router.use("/webhook", WebhookRouter);

router.use("/auth/google", GoogleAuthRouter.router);

module.exports = router;
