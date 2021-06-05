const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

const db = require("./models/index.js");
const {
  saveToken,
  updateToken,
  removeToken,
  triggerPush
} = require("./lib/token.js");

router.get("/", async (request, response) => {
  console.log("Push Notification Server Running");
  response.sendFile(__dirname + "/views/index.html");
});

router.post("/token", async (request, response) => {
  console.log(`Received push token, ${request.body.token.value}`);
  
  saveToken(request.body.token);

  response.send(`Received push token, ${request.body.token.value}`);
});

router.post("/message", async (request, response) => {
  triggerPush(request.body);

  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});

module.exports = router;
