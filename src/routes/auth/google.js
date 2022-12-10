const express = require("express");
const router = express.Router();

const { google } = require("googleapis");

const { GOOGLE_CLIENT_ID_WEB } = process.env;

const { loginAuthMethod } = require("../../controllers/auth/google");

async function getUserInfoFromIdToken(idToken) {
  const oauth2Client = new google.auth.OAuth2();

  const ticket = await oauth2Client.verifyIdToken({
    idToken: idToken,
    audience: GOOGLE_CLIENT_ID_WEB,
  });

  return ticket.payload;
}

router.post("/token", async (request, response, next) => {
  console.log(request.body);

  const googleUserInfo = await getUserInfoFromIdToken(request.body.idToken);

  const userLoggedIn = await loginAuthMethod(
    "google",
    googleUserInfo.sub,
    googleUserInfo
  );
  if (userLoggedIn) {
    return response.json({ success: true, user: userLoggedIn });
  }

  response.json({ success: false, response: googleUserInfo });
});

module.exports = { router };
