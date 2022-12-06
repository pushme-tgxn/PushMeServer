const express = require("express");
const { createHmac } = require("crypto");

const { getTopicById, getTopicByKey } = require("../controllers/topic");

const { validateDuoSignature } = require("../middleware/validate-duo");

const {
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  getPushResponse,
} = require("../service/push");

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

// The /preauth endpoint determines whether a user is authorized to log in, and (if so) returns the user's available authentication factors.
router.post("/preauth", validateDuoSignature, async (request, response) => {
  console.log("preauth", request.body, request.topic);
  const { username } = request.body;

  // no devices in topic, deny
  if (!request?.topic?.devices || request.topic.devices.length === 0) {
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
      device: `${device.deviceKey}`,
      display_name: `${device.name}`,
      name: `${device.name}`,
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
    const pushPayload = {
      categoryId: "button.approve_deny",
      title: "Test notification title!",
      body: "Test body.",
    };

    const createdPush = await createPushToTopic(request.topic, pushPayload);
    console.log("createdPush", pushPayload, createdPush);

    await pushToTopicDevices(request.topic, createdPush, pushPayload);

    // **wait** for push response here

    const waitForResponse = async (pushId, waitTime = 30) => {
      var totalLoops = 0; //  set your counter to 1

      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      async function checkForResponse() {
        const response = await getPushResponse(pushId);

        if (response) {
          console.log("checkForResponse", response);
          return response;
        }

        await timeout(1000);
        totalLoops++; // increment the counter (seconds)
        if (totalLoops < waitTime) {
          return await checkForResponse();
        } else {
          return false;
        }
      }

      return checkForResponse();
    };

    const result = await waitForResponse(createdPush.dataValues.id);
    console.log("result", result);

    if (JSON.parse(result.serviceResponse).actionIdentifier === "approve") {
      return response.json({
        stat: "OK",
        response: {
          result: "allow",
          status: "allow",
        },
        serviceData: JSON.parse(result.serviceResponse),
      });
    } else {
      return response.json({
        stat: "OK",
        response: {
          result: "deny",
          status: "deny",
        },
        serviceData: JSON.parse(result.serviceResponse),
      });
    }
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
