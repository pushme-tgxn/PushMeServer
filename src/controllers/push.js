const { Push, PushResponse } = require("../../models/index.js");

const { getTopicBySecretKey } = require("../services/topic");
// const { getDevice } = require("../controllers/device");

const {
  listPushesForUserId,
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  // updatePushByIdent,
  generatePushData,
} = require("../services/push");

const pollingResponses = {};

// map same as array of statuses
const getUserPushHistory = async (request, response) => {
  const pushList = await listPushesForUserId(request.user.id);

  response.json({
    success: true,
    pushes: pushList.map((push) => {
      return generatePushData(push);
    }),
  });
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
    console.debug("foundTopic", foundTopic.dataValues.id);

    const createdPush = await createPushToTopic(foundTopic);
    console.info("createPush", createdPush.dataValues);

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
    console.log("error", error);
    next(error);
  }
};

const recordPushResponse = async (request, response) => {
  const push = await getPushByIdent(request.params.pushIdent);

  console.log("recordPushResponse push", push);

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

  console.log("created", created);

  // const push = await updatePushByIdent(request.params.pushIdent, {
  //   serviceResponse: JSON.stringify(request.body.response),
  // });

  response.json({
    success: true,
    created,
  });

  postPoll(request.params.pushIdent, push, request.body);
};

const getPushStatus = async (request, response) => {
  console.log(`response`, request.body);

  const push = await getPushByIdent(request.params.pushIdent);

  if (!push) {
    return response.json({
      success: false,
    });
  }

  response.json(generatePushData(push));
};

const getPushStatusPoll = async (request, response) => {
  console.log(`response`, request.body);

  if (!pollingResponses[request.params.pushIdent]) {
    pollingResponses[request.params.pushIdent] = [];
  }

  pollingResponses[request.params.pushIdent].push(response);
};

const postPoll = (pushIdent, push, serviceResponse) => {
  if (pollingResponses.hasOwnProperty(pushIdent)) {
    console.log(
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
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
};
