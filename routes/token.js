const express = require("express");

const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const {
  listTokens,
  createToken,
  updateToken,
  findToken,
  removeToken
} = require("../service/token");

const authorize = require("../middleware/authorize");

const tokenRouter = express.Router();

tokenRouter.get("/", authorize(), async (request, response) => {
  console.log(`get token list`);

  const tokenList = await listTokens(request.body.token);

  response.setHeader("Content-Type", "application/json");
  response.status(200).send(JSON.stringify(tokenList));
});

tokenRouter.post("/", authorize(), async (request, response) => {
  console.log(
    `Received push token, ${request.body.token}, ${request.body.name}`
  );

  const { token, name } = request.body;

  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    throw new Error(`Push token ${token} is not a valid Expo push token`);
  }

  const foundToken = await findToken(token);
  let tokenResult;
  if (!foundToken) {
    tokenResult = await createToken({
      userId: request.user.sub,
      pushToken: token,
      tokenName: name
    });
  } else {
    tokenResult = await updateToken({
      userId: request.user.sub,
      pushToken: token,
      tokenName: name
    });
  }

  response.json({
    success: true,
    tokenResult
  });
});

tokenRouter.delete("/:tokenId", authorize(), async (request, response) => {
  console.log(
    `Received push token, ${request.params.tokenId}, ${request.body.name}`
  );

  const savedToken = await removeToken(request.params.tokenId);

  response.json({
    success: savedToken
  });
});

module.exports = tokenRouter;
