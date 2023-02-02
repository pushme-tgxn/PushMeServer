const express = require("express");
const router = express.Router();

const { loginAuthMethod, getUserInfoFromIdToken } = require("../../services/auth");

const { appLogger } = require("../../middleware/logging.js");

const postGenerateToken = async (request, response, next) => {
  try {
    appLogger.debug("postGenerateToken", request.body);

    const googleUserInfo = await getUserInfoFromIdToken(request.body.idToken);

    const userLoggedIn = await loginAuthMethod("google", googleUserInfo.sub, googleUserInfo);
    if (userLoggedIn) {
      return response.json({ success: true, user: userLoggedIn });
    }

    response.json({ success: false, response: googleUserInfo });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postGenerateToken,
};
