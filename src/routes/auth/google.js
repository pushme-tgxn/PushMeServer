const express = require("express");
const router = express.Router();

const { google } = require("googleapis");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// const { loginAuthMethod } = require("../../service/user");
const { loginAuthMethod } = require("../../service/auth/google");

async function getUserInfoFromAccessToken(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const res = await oauth2.userinfo.get();

  console.log(res.data);

  return res.data;
}

router.post("/token", async (request, response, next) => {
  console.log(request.body);

  const googleUserInfo = await getUserInfoFromAccessToken(
    request.body.accessToken
  );

  const userLoggedIn = await loginAuthMethod(
    "google",
    googleUserInfo.id,
    googleUserInfo
  );
  if (userLoggedIn) {
    return response.json({ success: true, user: userLoggedIn });
  }

  response.json({ success: false, response: googleUserInfo });
});

module.exports = { router };
