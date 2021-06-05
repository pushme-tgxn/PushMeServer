const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const db = require('./models/index.js');

router.get("/", (request, response) => {
  console.log("Push Notification Server Running");
  response.sendFile(__dirname + "/views/index.html");
});

router.post("/token", (request, response) => {
  
  saveToken(request.body.token);
  
  console.log(`Received push token, ${request.body.token.value}`);
  response.send(`Received push token, ${request.body.token.value}`);
});

router.post("/message", (request, response) => {
  
  handlePushTokens(request.body);
  
  console.log(`Received message, with title: ${request.body.title}`);
  response.send(`Received message, with title: ${request.body.title}`);
});


module.exports = router;
