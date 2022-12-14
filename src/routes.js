const express = require("express");

const router = express.Router();

const UserRouter = require("./routes/user.js");
const DeviceRouter = require("./routes/device.js");
const TopicRouter = require("./routes/topic.js");

const PushRouter = require("./routes/push.js");
const DuoAPIV2 = require("./routes/duo.js");
const PluginRouters = require("./routes/plugins.js");

const GoogleAuthRouter = require("./routes/auth/google.js");
const EmailAuthRouter = require("./routes/auth/email.js");

router.use("/user", UserRouter);
router.use("/device", DeviceRouter);
router.use("/topic", TopicRouter);

router.use("/push", PushRouter);

// router.use("/auth/v2", DuoAPIV2);
// router.use(PluginRouters);

PluginRouters(router);

router.use("/auth/google", GoogleAuthRouter.router);
router.use("/auth/email", EmailAuthRouter.router);

module.exports = router;
