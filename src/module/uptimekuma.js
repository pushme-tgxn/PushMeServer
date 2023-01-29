const { getTopicBySecretKey } = require("../services/topic");

const { createPushToTopic, pushToTopicDevices } = require("../services/push");

const { appLogger } = require("../middleware/logging.js");

const createUpTimeKumaPushRequest = async (request, response, next) => {
  try {
    const { msg, monitor, heartbeat } = request.body;

    console.log("inputPayload", { msg, monitor, heartbeat });

    const pushPayload = {
      categoryId: "simple.push",
      title: monitor ? `Uptime Kuma Alert - ${monitor}` : "Uptime Kuma Alert",
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
