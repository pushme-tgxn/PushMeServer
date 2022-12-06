const express = require("express");
const { createHmac } = require("crypto");

const { getTopicById } = require("../service/topic");

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

const validateDuoSignature = async (request, response, next) => {
  const b64auth = (request.headers.authorization || "").split(" ")[1] || "";
  const strauth = Buffer.from(b64auth, "base64").toString();
  const splitIndex = strauth.indexOf(":");

  const topicId = strauth.substring(0, splitIndex);
  const topicHash = strauth.substring(splitIndex + 1);

  const topic = await getTopicById(topicId);
  console.log("topicID", topicId, topicHash);

  // payload to hash for
  const duoAuthHash = [
    request.headers.date,
    request.method,
    request.hostname,
    `/auth/v2${request.path}`,
    request.method == "GET" ? request.headers.query : request.rawBody,
  ].join("\n");

  const calculatedHash = createHmac("sha512", topic.secretKey) // the golang api uses sha512, docs are wrong
    .update(duoAuthHash)
    .digest("hex");

  // test hash matched

  if (calculatedHash === topicHash) {
    console.log("hash matched");
    request.topic = topic;
    next();
  } else {
    console.log("hash mismatch", calculatedHash, topicHash);
    return response.json({
      error: "duo hash mismatch",
    });
  }
};

router.post("/preauth", validateDuoSignature, async (request, response) => {
  console.log("preauth", request.body);
  console.log("preauth HEADERS", request.headers);
  const { username } = request.body;

  return response.json({
    stat: "OK",
    response: {
      devices: [
        {
          capabilities: ["auto", "push"],
          device: "DPFZRS9FB0D46QFTM891", // TODO Random
          display_name: "WowPhone1 (XXX-XXX-6969)", // to get from token
          name: "",
          number: "XXX-XXX-6969", // to get from token
          type: "phone",
        },
      ],
      result: "auth",
      status_msg: "Account is active",
    },
  });
});

router.post("/auth", validateDuoSignature, async (request, response) => {
  const { device, username, factor, ipaddr, async } = request.body;
  console.log("auth", { device, username, factor, ipaddr });

  // non-async
  if (!async) {
    // wait for push response here

    return response.json({
      stat: "OK",
      response: {
        result: "allow",
        status: "allow",
      },
    });
  } else {
    return response.json({
      stat: "OK",
      response: {
        txid: "45f7c92b-f45f-4862-8545-e0f58e78075a",
      },
    });
  }
});

// unused for async
router.get("/auth_status", validateSignature, (request, response) => {
  console.log("auth_status", request.query);

  return response.json({
    stat: "OK",
    response: {
      result: "allow",
      status: "allow",
    },
  });
});

module.exports = router;
