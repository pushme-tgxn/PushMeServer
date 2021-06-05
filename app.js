const express = require("express");
const { Expo } = require("expo-server-sdk");
const cors = require("cors");

const routes = require('./routes');

const app = express();
const expo = new Expo();

app.use(cors());




let savedPushTokens = [];

const PORT_NUMBER = 3000;

const handlePushTokens = ({ title, body }) => {
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

const saveToken = token => {
  console.log(token, savedPushTokens);
  const exists = savedPushTokens.find(t => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};

app.use(express.static("public"));

app.use(express.json());

app.use("/", routes);

app.listen(PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});
