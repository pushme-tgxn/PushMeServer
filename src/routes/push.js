const express = require("express");

const authorize = require("../middleware/authorize");

const { getTopicBySecretKey, getTopic } = require("../service/topic");
const { getDevice } = require("../service/device");
const { updatePush } = require("../service/push");
const { triggerMultiPush } = require("../lib/push");

const { Push } = require("../../models/index.js");

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
  const pushPayload = request.body;

  const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
  if (!foundTopic) {
    return next(new Error("Topic secret key does not exist"));
  }
  console.log("foundTopic", request.params.topicSecret, foundTopic.dataValues);

  const createdPush = await Push.create({
    targetUserId: foundTopic.dataValues.userId,
    pushData: JSON.stringify(request.body),
  });
  console.log("createdPush", pushPayload, createdPush);

  // attach data payload for callback
  pushPayload.data = {};
  pushPayload.data.pushId = createdPush.dataValues.id;

  const deviceTokens = [];
  for (const item in foundTopic.dataValues.devices) {
    const device = foundTopic.dataValues.devices[item];
    const tokenData = await getDevice(device.dataValues.id);
    console.log("device", item, tokenData.dataValues.token);
    deviceTokens.push(tokenData.dataValues.token);
  }

  const requested = await triggerMultiPush(deviceTokens, pushPayload);
  console.log("requested", requested);

  await updatePush(createdPush.dataValues.id, {
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
