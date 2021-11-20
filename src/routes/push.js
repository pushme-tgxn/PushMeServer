const express = require("express");

const {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
} = require("../service/push");

const router = express.Router();

// push to topic with secret
router.post("/:topicSecret", createPushRequest);

// get information on a push request
router.post("/:pushIdent/response", recordPushResponse);
router.get("/:pushIdent/status", getPushStatus);
router.get("/:pushIdent/poll", getPushStatusPoll);

module.exports = router;
