const express = require("express");

const {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
} = require("../service/push");

const router = express.Router();

router.get("/ping", (request, response) => {
  console.log("ping");
  return response.json({
    stat: "OK",
    response: {
      time: 1357020061,
    },
  });
});

router.post("/preauth", (request, response) => {
  const { username } = request.body;
  console.log("preauth", request.body, request.query);

  return response.json({
    stat: "OK",
    response: {
      devices: [
        {
          capabilities: ["auto", "push"],
          device: "DPFZRS9FB0D46QFTM891",
          display_name: "iOS (XXX-XXX-0100)",
          name: "test",
          number: "XXX-XXX-0100",
          type: "phone",
        },
      ],
      result: "auth",
      status_msg: "Account is active",
    },
  });
});

router.post("/auth", (request, response) => {
  const { username, factor } = request.body;
  console.log("auth", request.body, request.query);

  return response.json({
    stat: "OK",
    response: {
      txid: "45f7c92b-f45f-4862-8545-e0f58e78075a",
    },
  });
});

router.post("/auth_status", (request, response) => {
  const { username, factor } = request.body;
  console.log("auth_status", request.body, request.query);

  // return response.json({
  //   stat: "OK",
  //   response: {
  //     result: "waiting",
  //     status: "pushed",
  //     status_msg: "Pushed a login request to your phone...",
  //   },
  // });

  return response.json({
    stat: "OK",
    response: {
      result: "allow",
      status: "allow",
    },
  });
});

// // get information on a push request
// router.post("/:pushIdent/response", recordPushResponse);
// router.get("/:pushIdent/status", getPushStatus);
// router.get("/:pushIdent/poll", getPushStatusPoll);

module.exports = router;
