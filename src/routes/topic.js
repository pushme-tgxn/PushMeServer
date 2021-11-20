const express = require("express");

const { authorize } = require("../middleware/authorize");

const {
  listTopics,
  getTopicForUser,
  createUserTopic,
  updateUserTopic,
  deleteUserTopic,
} = require("../service/topic");

const router = express.Router();

router.get("/", authorize(), listTopics);
router.get("/:topicId", authorize(), getTopicForUser);

router.post("/", authorize(), createUserTopic);
router.post("/:topicId", authorize(), updateUserTopic);

router.delete("/:topicId", authorize(), deleteUserTopic);

module.exports = router;
