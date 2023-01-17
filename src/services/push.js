const { v4: uuidv4 } = require("uuid");

const { Push, PushResponse } = require("../../models/index.js");

const { triggerMultiPush, triggerPushSingle } = require("../lib/push");
const {
  triggerMultiPushFCM,
  triggerPushSingleFCM,
} = require("../lib/push-fcm");

const { getDeviceById } = require("../services/device");

const { appLogger } = require("../middleware/logging.js");

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
    appLogger.warn("Pushing is disabled (DISABLE_PUSHING)");

    // fake service request
    await updatePush(createdPush.dataValues.id, {
      serviceType: "fake",
      serviceRequest: JSON.stringify({ is: "fake" }),
    });

    // create mock reponse
    if (process.env.MOCK_RESPONSE === "true") {
      appLogger.warn("Mocking response (MOCK_RESPONSE)");

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
    appLogger.debug("device", item, tokenData.dataValues.token);

    if (tokenData.dataValues.nativeToken) {
      const nativeTokenData = JSON.parse(tokenData.dataValues.nativeToken);
      appLogger.debug("nativeToken", nativeTokenData);

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
    appLogger.debug("requested", requestedExpo);

    await updatePush(createdPush.dataValues.id, {
      serviceType: "expo",
      serviceRequest: JSON.stringify(requestedExpo),
    });
  } else {
    appLogger.warn("no expo push tokens");
  }

  if (fcmPushMesages.length > 0) {
    const requestedFCM = await triggerMultiPushFCM(fcmPushMesages);
    appLogger.debug("requested FCM", requestedFCM);

    await updatePush(createdPush.dataValues.id, {
      serviceType: "fcm",
      serviceRequest: JSON.stringify(requestedFCM),
    });
  } else {
    appLogger.warn("no FCM push tokens");
  }
};

const updatePush = async (pushId, updateData) => {
  appLogger.debug("updatePush", pushId, updateData);
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
  appLogger.debug(`generatePushData`, push);

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
    if (validResponses.length > 0) {
      appLogger.debug(`generatePushData validResponses`, validResponses);
      firstValidResponse = JSON.parse(validResponses[0].serviceResponse);
    }
  } else {
    appLogger.debug(`generatePushData forcedResponse`, forcedResponse);
    validResponses = [{ serviceResponse: forcedResponse }];
    firstValidResponse = forcedResponse;
  }

  return {
    success: true,
    id: push.id,
    pushIdent: push.pushIdent,
    createdAt: push.createdAt,
    pushPayload: JSON.parse(push.pushPayload),
    serviceRequest: JSON.parse(push.serviceRequest),
    serviceResponses: validResponses,
    firstValidResponse: firstValidResponse,
  };
};

const updatePushByIdent = async (pushIdent, updateData) => {
  appLogger.debug("updatePushByIdent", pushIdent, updateData);
  const updated = await Push.update(updateData, {
    where: { pushIdent },
  });
  appLogger.debug("updated", updated);
  const record = await Push.findOne({
    where: { pushIdent },
  });
  appLogger.debug("record", record.toJSON());
  return record.toJSON();
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
