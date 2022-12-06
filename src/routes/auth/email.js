const express = require("express");
const router = express.Router();

const { authorize } = require("../../middleware/authorize");

const {
  loginAuthPair,
  updateEmail,
  updatePassword,
  createEmailAuth,
} = require("../../service/auth/email");

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

router.post("/email", authorize(), async (req, res, next) => {
  try {
    console.debug(req.user.id);
    if (req.body.email) {
      await updateEmail(req.user.id, req.body.email);
    } else {
      throw "email not provided";
    }
    res.json({ success: true, userId: req.user.id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/password", authorize(), async (req, res, next) => {
  try {
    console.debug(req.user.id);
    if (req.body.password) {
      await updatePassword(req.user.id, req.body.password);
    } else {
      throw "password not provided";
    }
    res.json({ success: true, userId: req.user.id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = { router };
