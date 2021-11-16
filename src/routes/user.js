const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const { listPushes } = require("../service/push");

const authorize = require("../middleware/authorize");
const userService = require("../service/user");

// router.post("/login", async (request, response, next) => {
//   console.log(request.body);
//   try {
//     const user = await userService.authenticate(request.body);
//     response.json({ success: true, user });
//   } catch (error) {
//     next(error);
//   }
// });

// router.get("/verify", async (request, response, next) => {
//   const token = request.headers.authorization.split(" ")[1];
//   console.log("verify", token);
//   try {
//     const token1 = jwt.verify(token, secret);
//     console.log("token verify", token1);
//     response.json(token1);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/", authorize(), async (request, response, next) => {
  const token = request.headers.authorization.split(" ")[1];
  console.log("verify", token);
  try {
    const token1 = jwt.verify(token, secret);
    console.log("token verify", token1);
    // response.json(token1);
    response.json({
      success: true,
      user: request.user,
      ureq: request.UserReq,
      token1,
    });
  } catch (error) {
    next(error);
  }
  // res.json({ user: req.user, ureq: req.UserReq, message: "You are logged in" });
});

// GET LIST OF HISTORY PUSHES
router.get("/history", authorize(), async (request, response) => {
  console.log(`get push list`);

  const pushList = await listPushes(request.user.id);
  response.json({
    success: true,
    pushes: pushList,
  });
  // response.setHeader("Content-Type", "application/json");
  // response.status(200).send(JSON.stringify(pushList));
});

module.exports = router;
