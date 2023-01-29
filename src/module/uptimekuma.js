const { getTopicBySecretKey } = require("../services/topic");

const { createPushToTopic, pushToTopicDevices } = require("../services/push");

const { appLogger } = require("../middleware/logging.js");

const createUpTimeKumaPushRequest = async (request, response, next) => {
  try {
    let { msg, monitor, heartbeat } = request.body;
    console.log("inputPayload", { msg, monitor, heartbeat });

    // only defined for non-tests
    if (monitor) {
      const isServiceUp = heartbeat.status == 1;
      const upOrDownText = isServiceUp ? " ✅ Up" : " ❌ Down";
      msg = `${heartbeat.time} [${monitor.name}] ${upOrDownText}`;
    }

    const pushPayload = {
      categoryId: "simple.push",
      title: monitor
        ? `UptimeKuma Alert - ${monitor.name}`
        : "UptimeKuma Push Test",
      body: msg,
    };

    const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
    if (!foundTopic) {
      return next(new Error("Topic secret key does not exist"));
    }
    appLogger.debug("foundTopic", foundTopic.dataValues.id);

    const createdPush = await createPushToTopic(foundTopic);
    appLogger.info("createPush", createdPush.dataValues);

    // respond early
    response
      .status(200)
      .json({
        success: true,
        pushIdent: createdPush.dataValues.pushIdent,
      })
      .send();

    await pushToTopicDevices(foundTopic, createdPush, pushPayload);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUpTimeKumaPushRequest,
};
