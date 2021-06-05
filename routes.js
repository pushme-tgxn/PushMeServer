const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

const {
  saveToken,
  listTokens,
  updateToken,
  removeToken,
  triggerPush,
  triggerPushSingle
} = require("./lib/token.js");

router.get("/", async (request, response) => {
  console.log("Push Notification Server Running");
  response.sendFile(__dirname + "/views/index.html");
});





module.exports = router;
