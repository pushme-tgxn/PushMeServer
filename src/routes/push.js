const express = require("express");

const { authorize } = require("../middleware/authorize");

const {
  getUserPushHistory,
  createPushRequest,
  recordPushReceipt,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
} = require("../controllers/push");

const { createUpTimeKumaPushRequest } = require("../module/uptimekuma");

const router = express.Router();

// push history
router.get("/", authorize(), getUserPushHistory);

// push to topic with secret
router.post("/:topicSecret", createPushRequest);
router.post("/:topicSecret/uptimekuma", createUpTimeKumaPushRequest);

// get information on a push request
router.post("/:pushIdent/receipt", recordPushReceipt); // when the notification is recieved

router.post("/:pushIdent/response", recordPushResponse); // when someone taps/clicks response on a push
router.get("/:pushIdent/status", getPushStatus); // to get current response data
router.get("/:pushIdent/poll", getPushStatusPoll); // poll till there is a response

module.exports = router;
