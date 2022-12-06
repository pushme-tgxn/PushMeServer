const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { v4: uuidv4 } = require("uuid");

const { Topic } = require("../../models/index.js");

const listTopics = async (request, response, next) => {
  try {
    console.log(`listTopics`, request.user.id);

    const topics = await Topic.scope({
      method: ["byUser", request.user.id],
    }).findAll();

    response.json({
      success: true,
      topics,
    });
  } catch (error) {
    next(error);
  }
};
const getTopicForUser = async (request, response, next) => {
  try {
    const topic = await getTopicById(request.params.topicId);
    response.json({
      success: true,
      topic,
    });
  } catch (error) {
    next(error);
  }
};
const createUserTopic = async (request, response, next) => {
  try {
    const { deviceIds } = request.body;

    let webhookResult = await createTopic(request.user.id, deviceIds);
    response.json({
      success: true,
      topic: webhookResult,
    });
  } catch (error) {
    next(error);
  }
};
const updateUserTopic = async (request, response, next) => {
  try {
    console.log(`response`, request.body);

    const updatedTopic = await updateTopic(
      request.params.topicId,
      request.body
    );
    response.json({
      success: true,
      topic: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};
const deleteUserTopic = async (request, response, next) => {
  try {
    console.log(`delete, ${request.params.topicId}`);

    const savedToken = await deleteTopic(request.params.topicId);

    response.json({
      success: savedToken,
    });
  } catch (error) {
    next(error);
  }
};

const createTopic = async (userId, deviceIds) => {
  console.log("createTopic", deviceIds);

  const createData = {
    userId: userId,
    secretKey: uuidv4(),
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

  const allowedFields = ["name"];
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
    console.log(`setDevices`, deviceIds);
    await topic.setDevices(deviceIds);
  }

  await topic.save();

  console.log("updateTopic", topic.toJSON());
  return topic.toJSON();
};

const deleteTopic = async (topicId) => {
  const deletedTopic = await Topic.destroy(
    { where: { id: topicId } },
    { return: true }
  );
  console.log(`deleteTopic`, deletedTopic);
  return deletedTopic;
};

const getTopicBySecretKey = async (topicSecret) => {
  return await Topic.scope({
    method: ["bySecret", topicSecret],
  }).findOne();
};

const getTopicById = async (topicId) => {
  console.log(`getTopicById`, topicId);

  const topic = await Topic.scope("withDevices").findOne({
    where: { id: topicId },
  });
  return topic;
};

module.exports = {
  listTopics,
  getTopicById,
  getTopicForUser,
  createUserTopic,
  updateUserTopic,
  deleteUserTopic,
  getTopicBySecretKey,
};
