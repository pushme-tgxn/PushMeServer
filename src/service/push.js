const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { v4: uuidv4 } = require("uuid");

const { Push } = require("../../models/index.js");

const { triggerMultiPush, triggerPushSingle } = require("../lib/push");

const { getTopicBySecretKey, getTopic } = require("../service/topic");
const { getDevice } = require("../service/device");

const pollingResponses = {};

const createPushRequest = async (request, response, next) => {
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
};

const recordPushResponse = async (request, response) => {
  console.log(`response`, request.body);

  const push = await updatePushByIdent(request.params.pushIdent, {
    serviceResponse: JSON.stringify(request.body.response),
  });

  response.json({
    success: true,
    push,
  });

  postPoll(request.params.pushIdent, push);
};

const getPushStatus = async (request, response) => {
  console.log(`response`, request.body);

  const push = await getPushByIdent(request.params.pushIdent);

  response.json({
    success: true,
    pushData: JSON.parse(push.pushData),
    serviceRequest: JSON.parse(push.serviceRequest),
    serviceResponse: JSON.parse(push.serviceResponse),
  });
};

const getPushStatusPoll = async (request, response) => {
  console.log(`response`, request.body);

  if (!pollingResponses[request.params.pushIdent]) {
    pollingResponses[request.params.pushIdent] = [];
  }

  pollingResponses[request.params.pushIdent].push(response);
};

const listPushes = async (userId) => {
  const tokens = await Push.scope({
    method: ["byTargetUser", userId],
  }).findAll();
  return tokens;
};

const postPoll = (pushIdent, push) => {
  if (pollingResponses.hasOwnProperty(pushIdent)) {
    console.log(
      `postPoll`,
      pushIdent,
      push,
      pollingResponses[pushIdent].length
    );
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
  }
};

const getPush = async (pushId) => {
  const push = await Push.findOne({
    where: { id: pushId },
  });
  return push;
};

const getPushByIdent = async (pushIdent) => {
  const push = await Push.findOne({
    where: { pushIdent },
  });
  return push;
};

const updatePush = async (pushId, updateData) => {
  console.log("updatePush", pushId, updateData);
  const updated = await Push.update(updateData, {
    where: { id: pushId },
  });
  const record = await Push.findOne({
    where: { id: pushId },
    raw: true,
  });
  return record;
};

const updatePushByIdent = async (pushIdent, updateData) => {
  console.log("updatePushByIdent", pushIdent, updateData);
  const updated = await Push.update(updateData, {
    where: { pushIdent },
    return: true,
    raw: true,
  });
  console.log("updated", updated);
  const record = await Push.findOne({
    where: { pushIdent },
    raw: true,
    return: true,
    raw: true,
  });
  console.log("record", record);
  return record;
};

// const createWebhookRequest = async (webhookId, requestPayload) => {
//   const createData = {
//     webhookId,
//     webhookRequest: JSON.stringify(requestPayload),
//   };
//   console.log("createWebhookRequest", createData);

//   return await WebhookRequest.create(createData);
// };

// const setCallbackResponse = async (webhookRequestId, callbackResponse) => {
//   console.log("setCallbackResponse", webhookRequestId, callbackResponse);

//   return await WebhookRequest.update(
//     { callbackResponse },
//     {
//       where: { id: webhookRequestId },
//     }
//   );
// };

module.exports = {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,

  // old
  listPushes,
  getPush,
  getPushByIdent,
  updatePush,
  updatePushByIdent,
  // createPush,
};
