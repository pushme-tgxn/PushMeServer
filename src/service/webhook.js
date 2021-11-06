const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const { v4: uuidv4 } = require("uuid");

const { Webhook, WebhookRequest } = require("../../models/index.js");

const createWebhook = async (tokenId) => {
  const createData = {
    tokenId: tokenId,
    secretKey: uuidv4(),
  };
  console.log("createWebhook", createData);

  return await Webhook.create(createData);
};

const updateWebhook = async (webhookId, { callbackUrl }) => {
  console.log("updateWebhook", callbackUrl);

  return await Webhook.update(
    { callbackUrl },
    {
      where: { id: webhookId },
    }
  );
};

const deleteWebhook = async (webhookId) => {
  return await Webhook.destroy({ where: { id: webhookId } });
};

const getWebhookBySecretKey = async (webhookSecret) => {
  return await Webhook.scope({
    method: ["bySecret", webhookSecret],
  }).findOne();
};

const createWebhookRequest = async (webhookId, requestPayload) => {
  const createData = {
    webhookId,
    webhookRequest: JSON.stringify(requestPayload),
  };
  console.log("createWebhookRequest", createData);

  return await WebhookRequest.create(createData);
};

const setCallbackResponse = async (webhookRequestId, callbackResponse) => {
  console.log("setCallbackResponse", webhookRequestId, callbackResponse);

  return await WebhookRequest.update(
    { callbackResponse },
    {
      where: { id: webhookRequestId },
    }
  );
};

module.exports = {
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookBySecretKey,
  createWebhookRequest,
  setCallbackResponse,
};
