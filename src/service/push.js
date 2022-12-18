const { v4: uuidv4 } = require("uuid");

const { Push, PushResponse } = require("../../models/index.js");

const { triggerMultiPush, triggerPushSingle } = require("../lib/push");
const {
  triggerMultiPushFCM,
  triggerPushSingleFCM,
} = require("../lib/push-fcm");

const { getDevice } = require("../controllers/device");

const createPushToTopic = async (foundTopic, pushPayload) => {
  console.log("createPushToTopic", foundTopic.dataValues);

  const createdPush = await Push.create({
    pushIdent: uuidv4(),
    targetUserId: foundTopic.dataValues.userId,
    pushData: JSON.stringify(pushPayload),
  });
  return createdPush;
};

const pushToTopicDevices = async (foundTopic, createdPush, pushPayload) => {
  // attach data payload for callback
  if (!pushPayload.data) {
    pushPayload.data = {};
  }

  pushPayload.data.pushId = createdPush.dataValues.id;
  pushPayload.data.pushIdent = createdPush.dataValues.pushIdent;

  const deviceTokens = [];
  const fcmPushMesages = [];
  for (const item in foundTopic.dataValues.devices) {
    const device = foundTopic.dataValues.devices[item];

    const tokenData = await getDevice(device.dataValues.id);
    console.log("device", item, tokenData.dataValues.token);

    if (true === false && tokenData.dataValues.nativeToken) {
      const nativeTokenData = JSON.parse(tokenData.dataValues.nativeToken);
      console.log("nativeToken", nativeTokenData);

      if (nativeTokenData.type == "android") {
        // nativeTokens.push(nativeTokenData.data);

        fcmPushMesages.push({
          token: nativeTokenData.data,
          android: {
            priority: "high",
          },
          data: {
            experienceId: "@tgxn/pushme",
            scopeKey: "@tgxn/pushme",
            categoryId: pushPayload.categoryId,
            title: pushPayload.title,
            message: pushPayload.body,
            body: JSON.stringify({
              pushId: createdPush.dataValues.id,
              pushIdent: createdPush.dataValues.pushIdent,
            }),
          },
        });
      } else {
        deviceTokens.push(tokenData.dataValues.token);
      }
    } else {
      deviceTokens.push(tokenData.dataValues.token);
    }
  }

  const requested = await triggerMultiPush(deviceTokens, pushPayload);
  console.log("requested", requested);

  const requestedFCM = await triggerMultiPushFCM(fcmPushMesages);
  console.log("requested FCM", requestedFCM);

  await updatePush(createdPush.dataValues.id, {
    pushPayload: JSON.stringify(pushPayload),
    serviceRequest: JSON.stringify(requested),
  });
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

const listPushesForUserId = async (userId) => {
  const tokens = await Push.scope({
    method: ["byTargetUser", userId],
  }).findAll();
  return tokens;
};

const getPush = async (pushId) => {
  const push = await Push.findOne({
    where: { id: pushId },
  });
  return push;
};

const getPushByIdent = async (pushIdent) => {
  const push = await Push.scope("withResponses").findOne({
    where: { pushIdent },
  });
  if (!push) {
    return null;
  }
  return push.toJSON();
};

// const updatePushByIdent = async (pushIdent, updateData) => {
//   console.log("updatePushByIdent", pushIdent, updateData);
//   const updated = await Push.update(updateData, {
//     where: { pushIdent },
//     return: true,
//     raw: true,
//   });
//   console.log("updated", updated);
//   const record = await Push.findOne({
//     where: { pushIdent },
//     raw: true,
//     return: true,
//     raw: true,
//   });
//   console.log("record", record);
//   return record;
// };

const getPushResponse = async (pushId) => {
  const pushResponse = await PushResponse.findOne({
    where: { pushId },
  });
  return pushResponse;
};

module.exports = {
  getPush,
  getPushByIdent,
  listPushesForUserId,
  createPushToTopic,
  pushToTopicDevices,

  getPushResponse,
  // updatePush,
  // updatePushByIdent,
};
