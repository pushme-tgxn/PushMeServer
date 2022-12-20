const express = require("express");

const router = express.Router();

const UserRouter = require("./routes/user.js");
const DeviceRouter = require("./routes/device.js");
const TopicRouter = require("./routes/topic.js");

const PushRouter = require("./routes/push.js");
const TrioAPI = require("./routes/trio.js");

const GoogleAuthRouter = require("./routes/auth/google.js");
const EmailAuthRouter = require("./routes/auth/email.js");

router.use("/user", UserRouter);
router.use("/device", DeviceRouter);
router.use("/topic", TopicRouter);

router.use("/push", PushRouter);

// "Trio" to avoid *confusion* with another well-known company
router.use("/auth/v2", TrioAPI);

router.use("/auth/google", GoogleAuthRouter.router);
router.use("/auth/email", EmailAuthRouter.router);

module.exports = router;
