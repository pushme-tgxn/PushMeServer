const { Topic } = require("../../models/index.js");

const { createTopic, updateTopic, deleteTopic, getTopicById, getTopicByKey, getTopicBySecretKey } = require("../services/topic.js");

const { appLogger } = require("../middleware/logging.js");

const listTopics = async (request, response, next) => {
  try {
    appLogger.debug(`listTopics`, request.user.id);

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
    appLogger.debug(`response`, request.body);

    const updatedTopic = await updateTopic(request.params.topicId, request.body);
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
    appLogger.debug(`delete, ${request.params.topicId}`);

    await deleteTopic(request.params.topicId);

    response.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTopics,
  getTopicForUser,
  createUserTopic,
  updateUserTopic,
  deleteUserTopic,
};
