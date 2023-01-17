const { Push, PushResponse } = require("../../models/index.js");

const { getTopicBySecretKey } = require("../services/topic");
// const { getDevice } = require("../controllers/device");

const {
  listPushesForUserId,
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  updatePush,
  updatePushByIdent,
  generatePushData,
} = require("../services/push");

const { appLogger } = require("../middleware/logging.js");

const pollingResponses = {};

// map same as array of statuses
const getUserPushHistory = async (request, response, next) => {
  try {
    const pushList = await listPushesForUserId(request.user.id);

    response.json({
      success: true,
      pushes: pushList.map((push) => {
        return generatePushData(push);
      }),
    });
  } catch (error) {
    next(error);
  }
};

const createPushRequest = async (request, response, next) => {
  try {
    const inputPayload = request.body;

    // validate push inputs
    let allowedfields = ["title", "body", "categoryId", "data"];
    let requiredFields = ["title", "categoryId"];
    let pushPayload = {
      title: "",
      body: "",
    };
    for (const field of allowedfields) {
      if (inputPayload.hasOwnProperty(field)) {
        pushPayload[field] = inputPayload[field];
      }
    }
    for (const field of requiredFields) {
      if (!pushPayload.hasOwnProperty(field)) {
        return next(new Error("Missing required field: " + field));
      }
    }

    const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
    if (!foundTopic) {
      return next(new Error("Topic secret key does not exist"));
    }
    appLogger.debug("foundTopic", foundTopic.dataValues.id);

    const createdPush = await createPushToTopic(foundTopic);
    appLogger.info("createPush", createdPush.dataValues);

    // respond early
    response
      .status(200)
      .json({
        success: true,
        pushIdent: createdPush.dataValues.pushIdent,
      })
      .send();

    await pushToTopicDevices(foundTopic, createdPush, pushPayload);
  } catch (error) {
    next(error);
  }
};

const recordPushResponse = async (request, response, next) => {
  try {
    const push = await getPushByIdent(request.params.pushIdent);

    appLogger.debug("recordPushResponse push", push);

    if (!push) {
      return response.json({
        success: false,
      });
    }

    const created = await PushResponse.create(
      {
        pushId: push.id,
        serviceResponse: JSON.stringify(request.body),
      },
      {
        return: true,
        raw: true,
      }
    );

    appLogger.debug("created", created);

    // const push = await updatePushByIdent(request.params.pushIdent, {
    //   serviceResponse: JSON.stringify(request.body.response),
    // });

    response.json({
      success: true,
      created,
    });

    postPoll(request.params.pushIdent, push, request.body);
  } catch (error) {
    next(error);
  }
};

const getPushStatus = async (request, response, next) => {
  try {
    appLogger.debug(`response`, request.body);

    const push = await getPushByIdent(request.params.pushIdent);

    if (!push) {
      return response.json({
        success: false,
      });
    }

    response.json(generatePushData(push));
  } catch (error) {
    next(error);
  }
};

const recordPushReceipt = async (request, response, next) => {
  try {
    appLogger.debug(`receipt`, request.body);

    // set receipt in db
    await updatePushByIdent(request.params.pushIdent, {
      pushReceipt: JSON.stringify(request.body),
    });

    response.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getPushStatusPoll = async (request, response, next) => {
  try {
    appLogger.debug(`response`, request.body);

    if (!pollingResponses[request.params.pushIdent]) {
      pollingResponses[request.params.pushIdent] = [];
    }

    pollingResponses[request.params.pushIdent].push(response);
  } catch (error) {
    next(error);
  }
};

const postPoll = (pushIdent, push, serviceResponse) => {
  if (pollingResponses.hasOwnProperty(pushIdent)) {
    appLogger.debug(
      `postPoll`,
      pushIdent,
      push,
      pollingResponses[pushIdent].length
    );

    const pushDataResponse = generatePushData(push, serviceResponse);
    pollingResponses[pushIdent].map((response) => {
      response.json(pushDataResponse).send().end();
    });
    delete pollingResponses[pushIdent];
  }
};

module.exports = {
  getUserPushHistory,
  createPushRequest,
  recordPushReceipt,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
};
