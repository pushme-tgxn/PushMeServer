const express = require("express");

const {
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookBySecretKey,
  createWebhookRequest,
  setCallbackResponse,
} = require("../service/webhook");

const { updatePush } = require("../service/push");

const authorize = require("../middleware/authorize");

const webhookRouter = express.Router();

const { triggerPush, triggerPushSingle } = require("../lib/push");

const { Push } = require("../../models/index.js");

// create
webhookRouter.post("/", authorize(), async (request, response) => {
  const { tokenId } = request.body;
  console.log(`Received webhookRouter POST, ${tokenId}`);

  let webhookResult = await createWebhook(tokenId);

  response.json({
    success: true,
    webhookResult,
  });
});

// update
webhookRouter.post("/:webhookId", authorize(), async (request, response) => {
  console.log(`${webhookRouter}: response`, request.body);

  response.json({
    success: true,
    updateWebhook: await updateWebhook(request.params.webhookId, {
      callbackUrl: request.body.callbackUrl,
    }),
  });
});

// delete
webhookRouter.delete("/:webhookId", authorize(), async (request, response) => {
  console.log(`delete, ${request.params.webhookId}`);

  const savedToken = await deleteWebhook(request.params.webhookId);

  response.json({
    success: savedToken,
  });
});

// push to a webhook
webhookRouter.post("/push/:secretKey", async (request, response, next) => {
  const webhook = await getWebhookBySecretKey(request.params.secretKey);
  if (!webhook) {
    return next(new Error("Webhook key does not exist"));
  }
  console.log("webhook", webhook);

  const createRequest = await createWebhookRequest(webhook.id, request.body);

  const created = await Push.create({
    senderId: 0,
    targetId: webhook.token.userId,
  });

  const pushPayload = request.body;
  pushPayload.data = {};
  pushPayload.data.pushId = created.dataValues.id;

  const requested = await triggerPushSingle(webhook.token.token, pushPayload);

  await updatePush(created.dataValues.id, {
    pushPayload: JSON.stringify(pushPayload),
    request: JSON.stringify(requested),
  });

  response.json({
    success: true,
    createRequest,
    requested,
  });
});

module.exports = webhookRouter;
