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
    // devices: deviceIds,
  };

  const createdTopic = await Topic.create(createData);
  createdTopic.addDevices(deviceIds);
  return createdTopic;
};

const updateTopic = async (topicId, { name, deviceIds, callbackUrl }) => {
  const topic = await Topic.scope("withDevices").findOne({
    where: { id: topicId },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  await topic.update({ callbackUrl });

  // topic.TopicDevices.DeviceId
  console.log(`updateTopic`, topicId, deviceIds);
  await topic.setDevices(deviceIds);

  await topic.save();

  console.log("updateTopic", deviceIds, callbackUrl, topic);
  return topic;
};

const deleteTopic = async (topicId) => {
  return await Topic.destroy({ where: { id: topicId } });
};

const getTopicBySecretKey = async (topicSecret) => {
  return await Topic.scope({
    method: ["bySecret", topicSecret],
  }).findOne();
};

const getTopic = async (topicId) => {
  console.log(`getTopic`, topicId);

  const topic = await Topic.scope("withDevices").findOne({
    where: { id: topicId },
  });
  return topic;
};

module.exports = {
  getTopic,
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicBySecretKey,
};
