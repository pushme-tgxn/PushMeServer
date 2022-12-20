const express = require("express");
const { createHmac } = require("crypto");

const { getTopicById, getTopicByKey } = require("../controllers/topic");

const { validateSignature } = require("../middleware/validate-signature");

const {
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  getPushResponse,
} = require("../services/push");

const router = express.Router();

// The /ping endpoint acts as a health check
router.get("/ping", (request, response) => {
  return response.json({
    stat: "OK",
    response: {
      time: Math.round(Date.now() / 1000),
      // added to indicate if we're currently validating signatures
      validation: process.env.NO_TRIO_AUTH ? "skipped" : "enabled",
    },
  });
});

// The /preauth endpoint determines whether a user is authorized to log in.
router.post("/preauth", validateSignature, async (request, response) => {
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

const WAIT_TIME = 30; // seconds

// The /auth endpoint performs second-factor authentication for a user by sending a push notification.
router.post("/auth", validateSignature, async (request, response) => {
  console.log("auth", request.body);
  const { device, username, factor, ipaddr, async } = request.body;

  // non-async
  if (!async) {
    const pushPayload = {
      categoryId: "button.approve_deny",
      title: `Login Approval Request`,
      subtitle: `Request from ${ipaddr}`,
      body: `Approve login request for ${username}?`,
      priority: "high",
      ttl: WAIT_TIME,
    };

    const createdPush = await createPushToTopic(request.topic, pushPayload);
    console.log("createdPush", pushPayload, createdPush);

    await pushToTopicDevices(request.topic, createdPush, pushPayload);

    // **wait** for push response here

    const waitForResponse = async (pushId) => {
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
        if (totalLoops < WAIT_TIME) {
          return await checkForResponse();
        } else {
          return false;
        }
      }

      return checkForResponse();
    };

    const result = await waitForResponse(createdPush.dataValues.id);
    console.log("result", result);
    if (result.serviceResponse) {
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
          result: "deny",
          status: "deny",
        },
        serviceData: {
          actionIdentifier: "noresponse",
        },
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
