const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const db = require('../models/index.js');

const saveToken = async pushToken => {
  console.log(pushToken);

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }
  
  const foundToken = await findToken(pushToken);
  if (!foundToken) {
    
    const created = await db.Token.create({
      token: pushToken,
    });
    
    return created;
  } else {
        const updated = await db.Token.update({
      token: pushToken,
    },{ where: { token: pushToken } });
    
    return updated;
  }
  
  
};

const listTokens = async () => {
  const tokens = await db.Token.findAll();
  return tokens;
};

const findToken = async (pushToken) => {
  const tokens = await db.Token.findOne({ where: { token: pushToken } });
  return tokens;
};


const updateToken = token => {
  console.log(token, savedPushTokens);
  const exists = savedPushTokens.find(t => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};

const removeToken = token => {
  console.log(token, savedPushTokens);
  const exists = savedPushTokens.find(t => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};


const triggerPush = async (requestBody) => {
  let notifications = [];
  
  const tokens = await listTokens();
  
  const { title, desc, } = requestBody;
  
  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      console.error(`Push token ${pushToken.token} is not a valid Expo push token`);
      continue;
    }

    notifications.push({
      to: pushToken.token,
      sound: "default",
      title: title,
      body: desc,
      data: { desc }
    });
  }
  
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = {
  saveToken,
  listTokens,
  updateToken,
  removeToken,
  triggerPush
};
