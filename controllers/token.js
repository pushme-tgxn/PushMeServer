
router.get("/token/list", async (request, response) => {
  console.log(`get token list`);
  
  const tokenList = await listTokens(request.body.token);
  
  response.setHeader('Content-Type', 'application/json');
  response.status(200).send(JSON.stringify(tokenList));
});

router.post("/token", async (request, response) => {
  console.log(`Received push token, ${request.body.token}, ${request.body.name}`);
  
  const savedToken = await saveToken(request.body.token, request.body.name);

  response.json({
    success: savedToken
  });
});
router.delete("/token", async (request, response) => {
  console.log(`Received push token, ${request.body.token}, ${request.body.name}`);
  
  const savedToken = await removeToken(request.body.token);

  response.json({
    success: savedToken
  });
});
