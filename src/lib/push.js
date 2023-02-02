// contains code that uses the expo api to send push notifications to a device token

const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { appLogger } = require("../middleware/logging.js");

/**
 * Send a push message to a single push token.
 * @param {*} toToken
 * @param {*} requestBody
 *
 * @returns {Promise}
 */
const triggerPushSingle = async (toToken, requestBody) => {
  appLogger.debug("triggerPushSingle", toToken, requestBody);

  if (!Expo.isExpoPushToken(toToken)) {
    appLogger.error(`Push token ${toToken} is not a valid Expo push token`);
    throw new Error(`Push token ${toToken} is not a valid Expo push token`);
  }

  const pushPayload = {
    to: toToken,
    ...requestBody,
  };

  const response = await sendNotificationsArray([pushPayload]);
  return response;
};

/**
 * Send a push message to multiple push tokens at once.
 * @param {string} toTokens
 * @param {string} requestBody
 *
 * @returns {Promise}
 */
const triggerMultiPush = async (toTokens, requestBody) => {
  let notifications = [];

  appLogger.debug("send data", toTokens, requestBody);

  for (let pushToken of toTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      appLogger.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    const pushPayload = {
      to: pushToken,
      ...requestBody,
    };

    appLogger.debug("payload", pushPayload);

    notifications.push(pushPayload);
  }

  const response = await sendNotificationsArray(notifications);
  return response;
};

const sendNotificationsArray = async (notifications) => {
  let chunks = expo.chunkPushNotifications(notifications);

  let returnData;
  for (let chunk of chunks) {
    try {
      let receipts = await expo.sendPushNotificationsAsync(chunk);
      appLogger.debug(receipts);

      let receiptIds = [];
      for (let ticket of receipts) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }

      let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

      // Like sending notifications, there are different strategies you could use
      // to retrieve batches of receipts from the Expo service.
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          appLogger.debug(receipts);

          // The receipts specify whether Apple or Google successfully received the
          // notification and information about an error, if one occurred.
          for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === "ok") {
              continue;
            } else if (status === "error") {
              appLogger.error(`There was an error sending a notification: ${message}`);
              if (details && details.error) {
                // The error codes are listed in the Expo documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                // You must handle the errors appropriately.
                appLogger.error(`The error code is ${details.error}`);
              }
            }
          }
          returnData = receipts;
        } catch (error) {
          appLogger.error(error);
        }
      }
    } catch (error) {
      appLogger.error(error);
    }
  }
  appLogger.debug("return sendNotificationsArray data", returnData);
  return returnData;
};

module.exports = {
  triggerPushSingle,
  triggerMultiPush,
};
