const { v4: uuidv4 } = require("uuid");

const { Push, PushResponse } = require("../../models/index.js");

const { triggerMultiPush, triggerPushSingle } = require("../lib/push");
const {
  triggerMultiPushFCM,
  triggerPushSingleFCM,
} = require("../lib/push-fcm");

const { getDeviceById } = require("../services/device");

const createPushToTopic = async (foundTopic) => {
  const createdPush = await Push.create({
    pushIdent: uuidv4(),
    targetUserId: foundTopic.dataValues.userId,
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

  // set final push payload
  await updatePush(createdPush.dataValues.id, {
    pushPayload: JSON.stringify(pushPayload),
  });

  if (process.env.DISABLE_PUSHING === "true") {
    console.warn("Pushing is disabled (DISABLE_PUSHING)");

    // fake service request
    await updatePush(createdPush.dataValues.id, {
      serviceType: "fake",
      serviceRequest: JSON.stringify({ is: "fake" }),
    });

    // create mock reponse
    if (process.env.MOCK_RESPONSE === "true") {
      console.warn("Mocking response (MOCK_RESPONSE)");

      await PushResponse.create(
        {
          pushId: createdPush.dataValues.id,
          serviceResponse: JSON.stringify({
            pushIdent: "33d2b1cb-fd8f-48ff-acde-e45d35ed7f1f",
            pushId: 268,
            actionIdentifier: "noresponse",
            categoryIdentifier: "button.acknowledge",
            responseText: null,
          }),
        },
        {
          return: true,
          raw: true,
        }
      );
    }

    return;
  }

  const deviceTokens = [];
  const fcmPushMesages = [];
  for (const item in foundTopic.dataValues.devices) {
    const device = foundTopic.dataValues.devices[item];

    const tokenData = await getDeviceById(device.dataValues.id);
    console.log("device", item, tokenData.dataValues.token);

    if (tokenData.dataValues.nativeToken) {
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
            body: JSON.stringify(pushPayload.data),
          },
        });
      } else {
        deviceTokens.push(tokenData.dataValues.token);
      }
    } else {
      deviceTokens.push(tokenData.dataValues.token);
    }
  }

  if (deviceTokens.length > 0) {
    const requestedExpo = await triggerMultiPush(deviceTokens, pushPayload);
    console.log("requested", requestedExpo);

    await updatePush(createdPush.dataValues.id, {
      serviceType: "expo",
      serviceRequest: JSON.stringify(requestedExpo),
    });
  } else {
    console.log("no expo push tokens");
  }

  if (fcmPushMesages.length > 0) {
    const requestedFCM = await triggerMultiPushFCM(fcmPushMesages);
    console.log("requested FCM", requestedFCM);

    await updatePush(createdPush.dataValues.id, {
      serviceType: "fcm",
      serviceRequest: JSON.stringify(requestedFCM),
    });
  } else {
    console.log("no FCM push tokens");
  }
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

/**
 *
 * @param {*} push
 * @param {*} forcedResponse
 * @returns
 */
const generatePushData = (push, forcedResponse = false) => {
  console.log(`generatePushData`, push);

  let validResponses;
  let firstValidResponse = null;
  if (!forcedResponse) {
    validResponses = push.PushResponses.filter((item) => {
      return item.serviceResponse !== null;
    }).sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } else {
    validResponses = { serviceResponse: forcedResponse };
  }

  if (validResponses.length > 0) {
    firstValidResponse = validResponses[0];
  }

  return {
    success: true,
    id: push.id,
    pushIdent: push.pushIdent,
    createdAt: push.createdAt,
    pushPayload: JSON.parse(push.pushPayload),
    serviceRequest: JSON.parse(push.serviceRequest),
    serviceResponses: validResponses,
    firstValidResponse: firstValidResponse
      ? JSON.parse(firstValidResponse.serviceResponse)
      : null,
  };
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
  updatePush,
  updatePushByIdent,

  generatePushData,
};
