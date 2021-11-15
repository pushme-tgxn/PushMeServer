const express = require("express");

const authorize = require("../middleware/authorize");

const {
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

router.get("/", authorize(), async (request, response) => {
  console.log(`listTopics`, request.user);

  const topicList = await listTopics(request.user.id);

  response.json({
    success: true,
    topics: topicList,
  });
});

// create
router.post("/", authorize(), async (request, response) => {
  const { deviceIds } = request.body;

  let webhookResult = await createTopic(request.user.id, deviceIds);
  response.json({
    success: true,
    topic: webhookResult,
  });
});

// update
router.post("/:topicId", authorize(), async (request, response) => {
  console.log(`${router}: response`, request.body);

  const updatedTopic = await updateTopic(request.params.topicId, {
    deviceIds: request.body.deviceIds,
    callbackUrl: request.body.callbackUrl,
  });
  response.json({
    success: true,
    topic: updatedTopic,
  });
});

// delete
router.delete("/:topicId", authorize(), async (request, response) => {
  console.log(`delete, ${request.params.topicId}`);

  const savedToken = await deleteTopic(request.params.topicId);

  response.json({
    success: savedToken,
  });
});

module.exports = router;
