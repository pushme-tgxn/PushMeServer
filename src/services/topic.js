const { v4: uuidv4 } = require("uuid");
const short = require("short-uuid");

const { Topic } = require("../../models/index.js");

const { appLogger } = require("../middleware/logging.js");

const createTopic = async (userId, deviceIds) => {
  appLogger.debug("createTopic", deviceIds);

  const createData = {
    userId: userId,
    topicKey: uuidv4(),
    secretKey: short.generate(),
  };

  const createdTopic = await Topic.create(createData);
  createdTopic.addDevices(deviceIds);

  return createdTopic;
};

const updateTopic = async (topicId, requestBody) => {
  let deviceIds = false;
  if (requestBody.deviceIds) {
    deviceIds = requestBody.deviceIds;
  }

  const allowedFields = ["name", "type"];
  Object.keys(requestBody).forEach((key) => {
    if (allowedFields.indexOf(key) === -1) delete requestBody[key];
  });

  const topic = await Topic.scope("withDevices").findOne({
    where: { id: topicId },
  });
  if (!topic) {
    throw new Error("Topic not found");
  }

  await topic.update(requestBody);

  if (deviceIds) {
    appLogger.debug(`setDevices`, deviceIds);
    await topic.setDevices(deviceIds);
  }

  await topic.save();

  appLogger.debug("updateTopic", topic.toJSON());
  return topic.toJSON();
};

const deleteTopic = async (topicId) => {
  const deletedTopic = await Topic.destroy(
    { where: { id: topicId } },
    { return: true }
  );
  appLogger.debug(`deleteTopic`, deletedTopic);
  return deletedTopic;
};

const getTopicBySecretKey = async (topicSecret) => {
  return await Topic.scope({
    method: ["bySecret", topicSecret],
  }).findOne();
};

const getTopicByKey = async (topicKey) => {
  appLogger.debug(`getTopicByKey`, topicKey);

  const topic = await Topic.scope("withDevices").findOne({
    where: { topicKey },
  });
  return topic;
};

const getTopicById = async (topicId) => {
  appLogger.debug(`getTopicById`, topicId);

  const topic = await Topic.scope("withDevices").findOne({
    where: { id: topicId },
  });
  return topic;
};

module.exports = {
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicById,
  getTopicByKey,
  getTopicBySecretKey,
};
