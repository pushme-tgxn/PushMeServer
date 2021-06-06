const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const db = require("../models/index.js");

const saveToken = async (pushToken, name = "") => {
  console.log(pushToken);

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
  }

  const foundToken = await findToken(pushToken);
  if (!foundToken) {
    const created = await db.Token.create({
      token: pushToken,
      name: name
    });

    return created;
  } else {
    const updated = await db.Token.update(
      {
        token: pushToken,
        name: name
      },
      { where: { token: pushToken } }
    );

    return updated;
  }
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

const triggerPush = async requestBody => {
  let notifications = [];

  const tokens = await listTokens();

  console.log("send data", requestBody);

  const { title, desc } = requestBody;

  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      console.error(
        `Push token ${pushToken.token} is not a valid Expo push token`
      );
      continue;
    }

    const pushPayload = {
      to: pushToken.token,
      title: title,
      body: desc,
      categoryId: `pushme`,
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

        let receiptIds = [];
        for (let ticket of receipts) {
          // NOTE: Not all tickets have IDs; for example, tickets for notifications
          // that could not be enqueued will have error information and no receipt ID.
          if (ticket.id) {
            receiptIds.push(ticket.id);
          }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
          // Like sending notifications, there are different strategies you could use
          // to retrieve batches of receipts from the Expo service.
          for (let chunk of receiptIdChunks) {
            try {
              let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
              console.log(receipts);

              // The receipts specify whether Apple or Google successfully received the
              // notification and information about an error, if one occurred.
              for (let receiptId in receipts) {
                let { status, message, details } = receipts[receiptId];
                if (status === "ok") {
                  continue;
                } else if (status === "error") {
                  console.error(
                    `There was an error sending a notification: ${message}`
                  );
                  if (details && details.error) {
                    // The error codes are listed in the Expo documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                    // You must handle the errors appropriately.
                    console.error(`The error code is ${details.error}`);
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        })();
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

const triggerPushSingle = async (toToken, requestBody) => {
  let notifications = [];

  console.log("send data", requestBody);

  const { title, desc } = requestBody;

  if (!Expo.isExpoPushToken(toToken)) {
    console.error(`Push token ${toToken} is not a valid Expo push token`);
    throw new Error(`Push token ${toToken} is not a valid Expo push token`);
  }

  const pushPayload = {
    to: toToken,
    title: "Test Push!",
    body: "This is what a push notifcation would look like@!!!",
    data: { random: Math.random() },
    categoryId: `pushme`,
  };

  console.log("payload", pushPayload);

  notifications.push(pushPayload);

  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);

        let receiptIds = [];
        for (let ticket of receipts) {
          // NOTE: Not all tickets have IDs; for example, tickets for notifications
          // that could not be enqueued will have error information and no receipt ID.
          if (ticket.id) {
            receiptIds.push(ticket.id);
          }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
          // Like sending notifications, there are different strategies you could use
          // to retrieve batches of receipts from the Expo service.
          for (let chunk of receiptIdChunks) {
            try {
              let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
              console.log(receipts);

              // The receipts specify whether Apple or Google successfully received the
              // notification and information about an error, if one occurred.
              for (let receiptId in receipts) {
                let { status, message, details } = receipts[receiptId];
                if (status === "ok") {
                  continue;
                } else if (status === "error") {
                  console.error(
                    `There was an error sending a notification: ${message}`
                  );
                  if (details && details.error) {
                    // The error codes are listed in the Expo documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                    // You must handle the errors appropriately.
                    console.error(`The error code is ${details.error}`);
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        })();
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
  triggerPush,
  triggerPushSingle
};
