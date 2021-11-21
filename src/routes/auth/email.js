const express = require("express");
const router = express.Router();

const { loginAuthPair, createEmailAuth } = require("../../service/user");

router.post("/login", async (request, response, next) => {
  console.log(request.body);
  try {
    const userLoggedIn = await loginAuthPair(
      request.body.email,
      request.body.password
    );
    if (userLoggedIn) {
      return response.json({ success: true, user: userLoggedIn });
    }

    response.json({ success: false, response: googleUserInfo });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const user = await createEmailAuth(req.body.email, req.body.password);
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = { router };
