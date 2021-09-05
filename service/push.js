const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { Push } = require("../models/index.js");

const { triggerPush, triggerPushSingle } = require("../lib/push");

const listPushes = async (userId) => {
  const tokens = await Push.scope({
    method: ["byTarget", userId],
  }).findAll();
  return tokens;
};

const createPush = async ({ userId, token, pushPayload }) => {
  console.log("createToken", userId, token, pushPayload);

  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    throw new Error(`Push token ${token} is not a valid Expo push token`);
  }

  const created = await Push.create({
    senderId: 0,
    targetId: userId,
  });

  pushPayload.data.pushId = created.dataValues.id;

  const request = await triggerPushSingle(token, pushPayload);

  await updatePush(created.dataValues.id, {
    pushPayload: JSON.stringify(pushPayload),
    request: JSON.stringify(request),
  });

  return created.dataValues;
};

const getPush = async (pushId) => {
  const push = await Push.findOne({
    where: { id: pushId },
  });
  return push;
};

const updatePush = async (pushId, updateData) => {
  console.log("updatePush", pushId, updateData);
  const updated = await Push.update(updateData, { where: { id: pushId } });
  return updated;
};

module.exports = {
  getPush,
  updatePush,
  createPush,
  listPushes,
};
