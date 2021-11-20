const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { authorize } = require("../middleware/authorize");

const { getTopicBySecretKey, getTopic } = require("../service/topic");
const { getDevice } = require("../service/device");
const {
  getPushByIdent,
  updatePush,
  updatePushByIdent,
} = require("../service/push");
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
  try {
    const pushPayload = request.body;

    const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
    if (!foundTopic) {
      return next(new Error("Topic secret key does not exist"));
    }
    console.log(
      "foundTopic",
      request.params.topicSecret,
      foundTopic.dataValues
    );

    const createdPush = await Push.create({
      pushIdent: uuidv4(),
      targetUserId: foundTopic.dataValues.userId,
      pushData: JSON.stringify(request.body),
    });
    console.log("createdPush", pushPayload, createdPush);

    // attach data payload for callback
    pushPayload.data = {};
    pushPayload.data.pushId = createdPush.dataValues.id;
    pushPayload.data.pushIdent = createdPush.dataValues.pushIdent;

    response
      .status(200)
      .json({
        success: true,
        pushIdent: createdPush.dataValues.pushIdent,
      })
      .send();

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
      serviceRequest: JSON.stringify(requested),
    });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

// update push
router.post("/:pushIdent/response", async (request, response) => {
  console.log(`response`, request.body);

  const push = await updatePushByIdent(request.params.pushIdent, {
    serviceResponse: JSON.stringify(request.body.response),
  });

  response.json({
    success: true,
    push,
  });

  postPoll(request.params.pushIdent, push);
});

router.get("/:pushIdent/status", async (request, response) => {
  console.log(`${router}: response`, request.body);

  const push = await getPushByIdent(request.params.pushIdent);

  response.json({
    success: true,
    pushData: JSON.parse(push.pushData),
    serviceRequest: JSON.parse(push.serviceRequest),
    serviceResponse: JSON.parse(push.serviceResponse),
  });
});

let pollingResponses = {};
router.get("/:pushIdent/poll", async (request, response) => {
  console.log(`${router}: response`, request.body);

  if (!pollingResponses[request.params.pushIdent]) {
    pollingResponses[request.params.pushIdent] = [];
  }

  pollingResponses[request.params.pushIdent].push(response);

  // const push = await getPushByIdent(request.params.pushIdent);

  // response.json({
  //   success: true,
  //   pushData: JSON.parse(push.pushData),
  //   serviceRequest: JSON.parse(push.serviceRequest),
  //   serviceResponse: JSON.parse(push.serviceResponse),
  // });
});

const postPoll = (pushIdent, push) => {
  console.log(`postPoll`, pushIdent, push, pollingResponses[pushIdent].length);
  pollingResponses[pushIdent].map((response) => {
    response
      .json({
        success: true,
        pushData: JSON.parse(push.pushData),
        serviceRequest: JSON.parse(push.serviceRequest),
        serviceResponse: JSON.parse(push.serviceResponse),
      })
      .send()
      .end();
  });
  delete pollingResponses[pushIdent];
};

module.exports = router;
