const { Expo } = require("expo-server-sdk");
const expo = new Expo();

// const { v4: uuidv4 } = require("uuid");

const { Push } = require("../../models/index.js");

// const { triggerPush, triggerPushSingle } = require("../lib/push");

const listPushes = async (userId) => {
  const tokens = await Push.scope({
    method: ["byTargetUser", userId],
  }).findAll();
  return tokens;
};

// const createPush = async ({ userId, token, pushPayload }) => {
//   console.log("createToken", userId, token, pushPayload);

//   if (!Expo.isExpoPushToken(token)) {
//     console.error(`Push token ${token} is not a valid Expo push token`);
//     throw new Error(`Push token ${token} is not a valid Expo push token`);
//   }

//   const created = await Push.create({
//     pushIdent: uuidv4(),
//     targetId: userId,
//   });

//   pushPayload.data.pushId = created.dataValues.id;
//   pushPayload.data.pushIdent = created.dataValues.pushIdent;

//   const request = await triggerPushSingle(token, pushPayload);

//   await updatePush(created.dataValues.id, {
//     pushPayload: JSON.stringify(pushPayload),
//     request: JSON.stringify(request),
//   });

//   return created.dataValues;
// };

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
  getPush,
  getPushByIdent,
  updatePush,
  updatePushByIdent,
  // createPush,
  listPushes,
};
