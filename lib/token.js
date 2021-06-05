const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const db = require('../models/index.js');

const saveToken = token => {
  console.log(token, savedPushTokens);
  const exists = savedPushTokens.find(t => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};

const listTokens = async () => {
  const tokens = await db.Token.findAll();
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


const triggerPush = (notificationPayload) => {
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    notifications.push({
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { body }
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
