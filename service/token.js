const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const db = require("../models/index.js");

const createToken = async ({ userId, pushToken, tokenName = "" }) => {
  console.log(pushToken);

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }

  const created = await db.Token.create({
    token: pushToken,
    name: tokenName
  });

  return created;
};

const updateToken = async ({ userId, pushToken, tokenName = "" }) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }

  const updated = await db.Token.update(
    {
      token: pushToken,
      name: tokenName
    },
    { where: { userId, token: pushToken } }
  );

  return updated;
};

const listTokens = async () => {
  const tokens = await db.Token.findAll();
  return tokens;
};

const findToken = async pushToken => {
  const tokens = await db.Token.findOne({ where: { token: pushToken } });
  return tokens;
};

const removeToken = async pushToken => {
  const removed = await db.Token.destroy({ where: { token: pushToken } });

  return removed;
};

module.exports = {
  findToken,
  createToken,
  updateToken,
  listTokens,
  removeToken
};
