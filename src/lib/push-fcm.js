const admin = require("firebase-admin");

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const { appLogger } = require("../middleware/logging.js");

const triggerPushSingleFCM = async (requestBody) => {
  appLogger.debug("triggerPushSingleFCM", requestBody);

  const returnData = await app.messaging().send(requestBody);
  return returnData;
};

/**
 * Send a push message to multiple push tokens at once.
 * @param {string} toTokens
 * @param {string} requestBody
 *
 * @returns {Promise}
 */
const triggerMultiPushFCM = async (notifications) => {
  appLogger.debug("triggerMultiPushFCM", notifications);

  const returnData = await app.messaging().sendAll(notifications);
  return returnData;
};

module.exports = {
  triggerPushSingleFCM,
  triggerMultiPushFCM,
};
