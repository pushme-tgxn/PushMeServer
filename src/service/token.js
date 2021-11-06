const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { Token } = require("../../models/index.js");

const createToken = async (createTokenData) => {
  console.log("createToken", createTokenData);

  if (!Expo.isExpoPushToken(createTokenData.token)) {
    console.error(
      `Push token ${createTokenData.token} is not a valid Expo push token`
    );
    throw new Error(
      `Push token ${createTokenData.token} is not a valid Expo push token`
    );
  }

  const created = await Token.create(createTokenData);

  return created;
};

const updateToken = async (tokenId, { userId, token, name }) => {
  console.log("updateToken", userId, token, name);

  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    throw new Error(`Push token ${token} is not a valid Expo push token`);
  }

  const updated = await Token.update(
    { userId, token, name },
    {
      where: { id: tokenId },
    }
  );

  return updated;
};

const listTokens = async (userId) => {
  console.log(`listTokens`, userId);
  const tokens = await Token.scope({
    method: ["byUser", userId],
  }).findAll();
  return tokens;
};

const getToken = async (tokenId) => {
  const tokens = await Token.scope({
    method: ["withToken", tokenId],
  }).findOne();
  return tokens;
};

const findToken = async (pushToken) => {
  const tokens = await Token.findOne({ where: { token: pushToken } });
  return tokens;
};

const removeToken = async (pushToken) => {
  const removed = await Token.destroy({ where: { token: pushToken } });

  return removed;
};

module.exports = {
  getToken,
  findToken,
  createToken,
  updateToken,
  listTokens,
  removeToken,
};
