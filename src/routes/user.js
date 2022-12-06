const express = require("express");

const { authorize } = require("../middleware/authorize");
const { listPushesForUserId } = require("../service/push");

const router = express.Router();

router.get("/", authorize(), async (request, response, next) => {
  try {
    response.json({
      success: true,
      user: request.user,
      methods: request.methods,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/history", authorize(), async (request, response) => {
  const pushList = await listPushesForUserId(request.user.id);
  response.json({
    success: true,
    pushes: pushList,
  });
});

module.exports = router;
