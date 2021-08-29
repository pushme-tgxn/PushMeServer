const express = require("express");

const { listPushes, createPush, updatePush } = require("../service/push");
const { getToken } = require("../service/token");

const authorize = require("../middleware/authorize");

const pushRouter = express.Router();

// GET LIST OF HISTORY PUSHES
pushRouter.get("/", authorize(), async (request, response) => {
  console.log(`get push list`);

  const pushList = await listPushes(request.user.id);

  response.setHeader("Content-Type", "application/json");
  response.status(200).send(JSON.stringify(pushList));
});

// push to a token (create push)
pushRouter.post("/:tokenId", authorize(), async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);

  // find the requested token id
  const tokenData = await getToken(request.params.tokenId);

  const createdPush = await createPush({
    userId: request.user.id,
    token: tokenData.token,
    pushPayload: request.body,
  });

  console.log("tokenData", tokenData, createdPush);

  response.json({
    success: true,
    createdPush,
  });
});

// update push
pushRouter.post("/:pushId/response", authorize(), async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);

  const pushes = await updatePush(request.params.pushId, {
    response: request.body.response,
  });

  response.json({
    success: true,
    pushes,
  });
});

module.exports = pushRouter;
