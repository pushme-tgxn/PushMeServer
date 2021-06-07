const express = require("express");

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
  const { token, name } = request.body;
  console.log(`Received push token, ${token}, ${name}`);

  const foundToken = await findToken(token);
  let tokenResult;
  if (!foundToken) {
    tokenResult = await createToken({
      userId: request.user.id,
      pushToken: token,
      tokenName: name
    });
  } else {
    tokenResult = await updateToken({
      userId: request.user.id,
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
