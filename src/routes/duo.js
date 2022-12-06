const express = require("express");
const { createHmac } = require("crypto");

const { getTopicById } = require("../service/topic");
const { getSystemErrorMap } = require("util");

const router = express.Router();

// The /ping endpoint acts as a "liveness check" that can be called to verify that Duo is up before trying to call other Auth API endpoints.
router.get("/ping", (request, response) => {
  return response.json({
    stat: "OK",
    response: {
      time: Math.round(Date.now() / 1000),
      validation: process.env.NO_DUO_AUTH ? "skipped" : "enabled", // added to indicate if we're currently validating cert
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

  // if `NO_DUO_AUTH` is set, skip signature validation
  if (process.env.NO_DUO_AUTH) {
    console.log("skipping duo signature validation");
    request.topic = topic;
    return next();
  }

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

// The /preauth endpoint determines whether a user is authorized to log in, and (if so) returns the user's available authentication factors.
router.post("/preauth", validateDuoSignature, async (request, response) => {
  console.log("preauth", request.body, request.topic);
  const { username } = request.body;

  // no devices in topic, deny
  if (!request?.topic?.devices) {
    return response.json({
      stat: "OK",
      response: {
        devices: [],
        result: "deny",
        status_msg: "No devices in topic",
      },
    });
  }

  // loop devices, create array
  const devices = request.topic.devices.map((device) => {
    return {
      capabilities: ["auto", "push"],
      device: `DEVICE-${device.id}`,
      display_name: `${device.name}`,
      name: "",
      number: "",
      type: "phone",
    };
  });

  return response.json({
    stat: "OK",
    response: {
      devices: devices,
      result: "auth", // TODO this should take into account lockouts, etc.
      status_msg: "Account is active",
    },
  });
});

// The /auth endpoint performs second-factor authentication for a user by sending a push notification to the user's smartphone app, verifying a passcode, or placing a phone call.
router.post("/auth", validateDuoSignature, async (request, response) => {
  console.log("auth", request.body);
  const { device, username, factor, ipaddr, async } = request.body;

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
router.get("/auth_status", validateDuoSignature, (request, response) => {
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
