const {
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  getPushResponse,
} = require("../services/push");

const { appLogger } = require("../middleware/logging.js");

const WAIT_TIME = 30; // seconds

// The /ping endpoint acts as a health check
const getPing = async (request, response, next) => {
  try {
    return response.json({
      stat: "OK",
      response: {
        time: Math.round(Date.now() / 1000),
        // added to indicate if we're currently validating signatures
        validation: process.env.NO_TRIO_AUTH ? "skipped" : "enabled",
      },
    });
  } catch (error) {
    next(error);
  }
};

// The /preauth endpoint determines whether a user is authorized to log in.
const postPreAuth = async (request, response, next) => {
  try {
    appLogger.debug("preauth", request.body, request.topic);

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
  } catch (error) {
    next(error);
  }
};

// The /auth endpoint performs second-factor authentication for a user by sending a push notification.
const postAuth = async (request, response, next) => {
  try {
    appLogger.debug("auth", request.body);
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
      appLogger.debug("createdPush", pushPayload, createdPush);

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
            appLogger.debug("checkForResponse", response);
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
      appLogger.debug("result", result);
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
  } catch (error) {
    next(error);
  }
};

// unused for async
const postAuthStatus = async (request, response, next) => {
  try {
    appLogger.debug("auth_status", request.query);

    return response.json({
      stat: "OK",
      response: {
        result: "allow",
        status: "allow",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPing,
  postPreAuth,
  postAuth,
  postAuthStatus,
};
