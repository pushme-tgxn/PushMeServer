const express = require("express");

const { authorize } = require("../middleware/authorize");
const { listPushes } = require("../service/push");

const router = express.Router();

router.get("/", authorize(), async (request, response, next) => {
  try {
    response.json({
      success: true,
      ureq: request.UserReq,
      user: request.user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/history", authorize(), async (request, response) => {
  const pushList = await listPushes(request.user.id);
  response.json({
    success: true,
    pushes: pushList,
  });
});

module.exports = router;
