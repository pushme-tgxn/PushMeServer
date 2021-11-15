const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { v4: uuidv4 } = require("uuid");

const { Topic } = require("../../models/index.js");

const listTopics = async (userId) => {
  console.log(`listTopics`, userId);

  const topics = await Topic.scope({
    method: ["byUser", userId],
  }).findAll();
  return topics;
};

const createTopic = async (userId, deviceIds) => {
  console.log("createTopic", deviceIds);

  const createData = {
    userId: userId,
    secretKey: uuidv4(),
    deviceIds,
  };

  return await Topic.create(createData);
};

const updateTopic = async (topicId, { deviceIds, callbackUrl }) => {
  const result = await Topic.update(
    { callbackUrl, devices: deviceIds },
    {
      where: { id: topicId },
    }
  );

  console.log("updateTopic", deviceIds, callbackUrl, result);
  return result;
};

const deleteTopic = async (topicId) => {
  return await Topic.destroy({ where: { id: topicId } });
};

const getTopicBySecretKey = async (topicSecret) => {
  return await Topic.scope({
    method: ["bySecret", topicSecret],
  }).findOne();
};

module.exports = {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicBySecretKey,
};
