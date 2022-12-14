const admin = require("firebase-admin");

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const triggerPushSingle = async (toToken, requestBody) => {
  console.log("triggerPushSingle", toToken, requestBody);

  const message = {
    token: toToken,
    data: requestBody,
  };
  // Send a message to the device corresponding to the provided
  // registration token.
  app
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};

// /**
//  * Send a push message to a single push token.
//  * @param {*} toToken
//  * @param {*} requestBody
//  *
//  * @returns {Promise}
//  */
// const triggerPushSingle = async (toToken, requestBody) => {
//   console.log("triggerPushSingle", toToken, requestBody);

//   if (!Expo.isExpoPushToken(toToken)) {
//     console.error(`Push token ${toToken} is not a valid Expo push token`);
//     throw new Error(`Push token ${toToken} is not a valid Expo push token`);
//   }

//   const pushPayload = {
//     to: toToken,
//     ...requestBody,
//   };

//   const response = await sendNotificationsArray([pushPayload]);
//   return response;
// };

// /**
//  * Send a push message to multiple push tokens at once.
//  * @param {string} toTokens
//  * @param {string} requestBody
//  *
//  * @returns {Promise}
//  */
// const triggerMultiPush = async (toTokens, requestBody) => {
//   let notifications = [];

//   console.log("send data", toTokens, requestBody);

//   for (let pushToken of toTokens) {
//     if (!Expo.isExpoPushToken(pushToken)) {
//       console.error(`Push token ${pushToken} is not a valid Expo push token`);
//       continue;
//     }

//     const pushPayload = {
//       to: pushToken,
//       ...requestBody,
//     };

//     console.log("payload", pushPayload);

//     notifications.push(pushPayload);
//   }

//   const response = await sendNotificationsArray(notifications);
//   return response;
// };

// const sendNotificationsArray = async (notifications) => {
//   let chunks = expo.chunkPushNotifications(notifications);

//   let returnData;
//   for (let chunk of chunks) {
//     try {
//       let receipts = await expo.sendPushNotificationsAsync(chunk);
//       // console.log(receipts);

//       let receiptIds = [];
//       for (let ticket of receipts) {
//         // NOTE: Not all tickets have IDs; for example, tickets for notifications
//         // that could not be enqueued will have error information and no receipt ID.
//         if (ticket.id) {
//           receiptIds.push(ticket.id);
//         }
//       }

//       let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

//       // Like sending notifications, there are different strategies you could use
//       // to retrieve batches of receipts from the Expo service.
//       for (let chunk of receiptIdChunks) {
//         try {
//           let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//           // console.log(receipts);

//           // The receipts specify whether Apple or Google successfully received the
//           // notification and information about an error, if one occurred.
//           for (let receiptId in receipts) {
//             let { status, message, details } = receipts[receiptId];
//             if (status === "ok") {
//               continue;
//             } else if (status === "error") {
//               console.error(
//                 `There was an error sending a notification: ${message}`
//               );
//               if (details && details.error) {
//                 // The error codes are listed in the Expo documentation:
//                 // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
//                 // You must handle the errors appropriately.
//                 console.error(`The error code is ${details.error}`);
//               }
//             }
//           }
//           returnData = receipts;
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }
//   console.log("rerereerer", returnData);
//   return returnData;
// };

module.exports = {
  triggerPushSingle,
};
