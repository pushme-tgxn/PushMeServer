const express = require("express");

const {
  listTokens,
  createToken,
  updateToken,
  findToken,
  removeToken,
} = require("../service/token");

const authorize = require("../middleware/authorize");

const tokenRouter = express.Router();

tokenRouter.get("/", authorize(), async (request, response) => {
  console.log(`get token list`, request.user);

  const tokenList = await listTokens(request.user.id);

  response.setHeader("Content-Type", "application/json");
  response.status(200).send(JSON.stringify(tokenList));
});

tokenRouter.post("/", authorize(), async (request, response) => {
  const { token, name } = request.body;
  console.log(`Received push token, ${token}, ${name}`);

  const updatePayload = {
    userId: request.user.id,
    token: token,
  };

  if (name) {
    updatePayload.name = name;
  }

  const foundToken = await findToken(token);

  let tokenResult;
  if (!foundToken) {
    tokenResult = await createToken(updatePayload);
  } else {
    tokenResult = await updateToken(foundToken.id, updatePayload);
  }

  response.json({
    success: true,
    tokenResult,
  });
});

tokenRouter.post("/:tokenId", authorize(), async (request, response, next) => {
  const { token, name } = request.body;
  console.log(`Received push token, ${token}, ${name}`);

  const updatePayload = {
    userId: request.user.id,
    token: token,
  };
  if (name) {
    updatePayload.name = name;
  }

  const foundToken = await findToken(token);

  let tokenResult;
  if (!foundToken) {
    return next(new Error("Token not found"));
  } else {
    tokenResult = await updateToken(request.params.tokenId, updatePayload);
  }

  response.json({
    success: true,
    tokenResult,
  });
});

tokenRouter.delete("/:tokenId", authorize(), async (request, response) => {
  console.log(
    `Received push token, ${request.params.tokenId}, ${request.body.name}`
  );

  const savedToken = await removeToken(request.params.tokenId);

  response.json({
    success: savedToken,
  });
});

module.exports = tokenRouter;
