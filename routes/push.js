const express = require("express");

const { triggerPush, triggerPushSingle } = require("../service/push");

const authorize = require("../middleware/authorize");

const pushRouter = express.Router();

pushRouter.post("/all", async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);

  const pushes = await triggerPush(request.body);

  response.json({
    success: true,
    pushes
  });
});

// pushRouter.post("/", authorize(), async (request, response) => {
//   console.log(`${pushRouter}: rx`, request.body);

//   const pushes = await triggerPush(request.body);

//   response.json({
//     success: true,
//     pushes
//   });
// });

pushRouter.post("/:tokenId", authorize(), async (request, response) => {
  console.log(`${pushRouter}: rx`, request.body);

  const pushes = await triggerPushSingle(request.params.tokenId, request.body);

  response.json({
    success: true,
    pushes
  });
});

module.exports = pushRouter;
