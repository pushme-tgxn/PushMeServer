const express = require("express");

// const { createPush, updatePush } = require("../service/push");
// const { getDevice } = require("../service/device");
const { getTopicBySecretKey } = require("../service/topic");

const authorize = require("../middleware/authorize");

const router = express.Router();

// // push to a token (create push)
// pushRouter.post("/:tokenId", authorize(), async (request, response) => {
//   console.log(`${pushRouter}: rx`, request.body);

//   // find the requested token id
//   const tokenData = await getDevice(request.params.tokenId);

//   const createdPush = await createPush({
//     userId: request.user.id,
//     token: tokenData.token,
//     pushPayload: request.body,
//   });

//   console.log("tokenData", tokenData, createdPush);

//   response.json({
//     success: true,
//     createdPush,
//   });
// });

router.post("/:topicSecret", async (request, response, next) => {
  const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
  if (!foundTopic) {
    return next(new Error("Topic secret key does not exist"));
  }
  console.log("foundTopic", foundTopic);

  // const createRequest = await createWebhookRequest(webhook.id, request.body);

  const created = await Push.create({
    senderId: 0,
    targetId: webhook.token.userId,
  });

  const pushPayload = request.body;
  pushPayload.data = {};
  pushPayload.data.pushId = created.dataValues.id;

  const requested = await triggerPushSingle(webhook.token.token, pushPayload);

  await updatePush(created.dataValues.id, {
    pushPayload: JSON.stringify(pushPayload),
    request: JSON.stringify(requested),
  });

  response.json({
    success: true,
    // createRequest,
    requested,
  });
});

// update push
router.post("/:pushId/response", authorize(), async (request, response) => {
  console.log(`${router}: response`, request.body);

  const pushes = await updatePush(request.params.pushId, {
    response: JSON.stringify(request.body.response),
  });

  response.json({
    success: true,
    pushes,
  });
});

module.exports = router;
