const express = require("express");

const {
  triggerPush,
  triggerPushSingle
} = require("../lib/token.js");

const pushRouter = express.Router();

pushRouter.post("/", async (request, response) => {
  const pushes = await triggerPush(request.body);

  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});

pushRouter.get("/:tokenId", async (request, response) => {
  
  console.log(request.params.tokenId)
  const pushes = await triggerPushSingle(request.params.tokenId, request.body);

  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});

module.exports = pushRouter;
