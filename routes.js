const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

const {
  saveToken,
  listTokens,
  updateToken,
  removeToken,
  triggerPush
} = require("./lib/token.js");

router.get("/", async (request, response) => {
  console.log("Push Notification Server Running");
  response.sendFile(__dirname + "/views/index.html");
});

router.get("/list", async (request, response) => {
  console.log(`get token list`);
  
  const tokenList = await listTokens(request.body.token);
  
  response.setHeader('Content-Type', 'application/json');
  response.status(200).send(JSON.stringify(tokenList));
});

router.post("/register", async (request, response) => {
  console.log(`Received push token, ${request.body.token}, ${request.body.name}`);
  
  const savedToken = await saveToken(request.body.token, request.body.name);

  response.json({
    success: savedToken
  });
});

router.post("/push", async (request, response) => {
  const pushes = await triggerPush(request.body);

  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});

router.post("/push/:tokenId", async (request, response) => {
  const pushes = await triggerPush(request.body);

  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});

module.exports = router;
