const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const db = require('../models/index.js');

const saveToken = async (pushToken, name="") => {
  console.log(pushToken);

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }
  
  const foundToken = await findToken(pushToken);
  if (!foundToken) {
    
    const created = await db.Token.create({
      token: pushToken,
      name: name,
    });
    
    return created;
  } else {
    const updated = await db.Token.update({
      token: pushToken,
      name: name,
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

const removeToken = async pushToken => {
  
 const removed = await db.Token.destroy({ where: { token: pushToken } });
  
   return removed;
};


const triggerPush = async (requestBody) => {
  let notifications = [];
  
  const tokens = await listTokens();
  
  console.log("send data", requestBody);
  
  const { title, desc, } = requestBody;
  
  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      console.error(`Push token ${pushToken.token} is not a valid Expo push token`);
      continue;
    }
    
    const pushPayload = {
      to: pushToken.token,
      channelId: "default",
      subtitle: title,
      title: title,
      body: desc,
      // data: { foo: "bar" }d
    };
    
    console.log("payload", pushPayload);

    notifications.push(pushPayload);
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
  removeToken,
  triggerPush
};
