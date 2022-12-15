const express = require("express");

const {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
} = require("../controllers/push");

const router = express.Router();

// push to topic with secret
router.post("/:topicSecret", createPushRequest);

// get information on a push request
router.post("/:pushIdent/response", recordPushResponse); // when someone taps/clicks response on a push
router.get("/:pushIdent/status", getPushStatus); // to get response data
router.get("/:pushIdent/poll", getPushStatusPoll); // poll till there is a response

module.exports = router;
