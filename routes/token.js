const express = require("express");

const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const {
  listTokens,
  createToken,
  updateToken,
  findToken,
  removeToken
} = require("../lib/token.js");

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
  if (!foundToken) {
    
    const savedToken = await createToken({
      userId: 1,
      token
    });

    return savedToken;
  } else {
    const updated = await db.Token.update(
      {
        token: pushToken,
        name: name
      },
      { where: { token: pushToken } }
    );
const savedToken = await updateToken({
      userId: 1,
      token: token
    });
    return updated;
  }

  response.json({
    success: savedToken
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
