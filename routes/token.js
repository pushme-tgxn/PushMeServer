const express = require("express");

const {
  listTokens,
  saveToken,
  removeToken
} = require("../lib/token.js");

const authorize = require('../middleware/authorize')

const tokenRouter = express.Router();

tokenRouter.get("/", authorize(), async (request, response) => {
  console.log(`get token list`);
  
  const tokenList = await listTokens(request.body.token);
  
  response.setHeader('Content-Type', 'application/json');
  response.status(200).send(JSON.stringify(tokenList));
});

tokenRouter.post("/", authorize(), async (request, response) => {
  console.log(`Received push token, ${request.body.token}, ${request.body.name}`);
  
  const savedToken = await saveToken(request.body.token, request.body.name);

  response.json({
    success: savedToken
  });
  
});
tokenRouter.delete("/:tokenId", authorize(), async (request, response) => {
  console.log(`Received push token, ${request.params.tokenId}, ${request.body.name}`);
  
  const savedToken = await removeToken(request.params.tokenId);

  response.json({
    success: savedToken
  });
});

module.exports = tokenRouter;
