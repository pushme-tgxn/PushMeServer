const express = require("express");
const jwt = require("jsonwebtoken");

const { authorize } = require("../middleware/authorize");
const { listPushes } = require("../service/push");

const secret = process.env.SECRET;
const router = express.Router();

router.get("/", authorize(), async (request, response, next) => {
  console.log(`/PUSH/, UserID: ${request.user.id}`);
  const token = request.headers.authorization.split(" ")[1];
  try {
    const token1 = jwt.verify(token, secret);
    console.log("token verify", token1);
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
  console.log(`/PUSH/history, UserID: ${request.user.id}`);
  const pushList = await listPushes(request.user.id);
  response.json({
    success: true,
    pushes: pushList,
  });
});

module.exports = router;
