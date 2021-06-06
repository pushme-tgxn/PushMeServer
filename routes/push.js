const express = require("express");

const {
  triggerPush,
  triggerPushSingle
} = require("../lib/token.js");

const authorize = require('../middleware/authorize')

const pushRouter = express.Router();

pushRouter.post("/all",  async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);
  
  const pushes = await triggerPush(request.body);

  
  response.json({
    success:true,
  });
});

pushRouter.post("/", authorize(), async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);
  
  const pushes = await triggerPush(request.body);

  response.json({
    success:true,
  });
});

pushRouter.get("/:tokenId", authorize(), async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);
  
  const pushes = await triggerPushSingle(request.params.tokenId, request.body);

  response.send(`Received message, with title: ${request.body.title}`);
});

module.exports = pushRouter;
