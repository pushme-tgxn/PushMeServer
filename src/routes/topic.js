const express = require("express");

const { authorize } = require("../middleware/authorize");

const {
  getTopic,
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicBySecretKey,
} = require("../service/topic");

// const { updatePush } = require("../service/push");

const router = express.Router();

// const { triggerPushSingle } = require("../lib/push");

// const { Push } = require("../../models/index.js");

router.get("/", authorize(), async (request, response, next) => {
  try {
    console.log(`listTopics`, request.user);

    const topicList = await listTopics(request.user.id);

    response.json({
      success: true,
      topics: topicList,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:topicId", authorize(), async (request, response, next) => {
  try {
    console.log(`listTopics`, request.user);

    const topic = await getTopic(request.params.topicId);
    response.json({
      success: true,
      topic,
    });
  } catch (error) {
    next(error);
  }
});

// create
router.post("/", authorize(), async (request, response, next) => {
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
});

// update
router.post("/:topicId", authorize(), async (request, response, next) => {
  try {
    console.log(`${router}: response`, request.body);

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
});

// delete
router.delete("/:topicId", authorize(), async (request, response, next) => {
  try {
    console.log(`delete, ${request.params.topicId}`);

    const savedToken = await deleteTopic(request.params.topicId);

    response.json({
      success: savedToken,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
