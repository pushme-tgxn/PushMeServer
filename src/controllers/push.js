const { Push, PushResponse } = require("../../models/index.js");

const { getTopicBySecretKey } = require("../services/topic");
// const { getDevice } = require("../controllers/device");

const {
  createPushToTopic,
  pushToTopicDevices,
  getPushByIdent,
  // updatePushByIdent,
} = require("../services/push");

const pollingResponses = {};

const createPushRequest = async (request, response, next) => {
  try {
    const pushPayload = request.body;

    const foundTopic = await getTopicBySecretKey(request.params.topicSecret);
    if (!foundTopic) {
      return next(new Error("Topic secret key does not exist"));
    }
    console.log(
      "foundTopic",
      request.params.topicSecret,
      foundTopic.dataValues
    );

    const createdPush = await createPushToTopic(foundTopic, pushPayload);
    console.log("createdPush", pushPayload, createdPush);

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

  postPoll(request.params.pushIdent, push);
};

const getPushStatus = async (request, response) => {
  console.log(`response`, request.body);

  const push = await getPushByIdent(request.params.pushIdent);

  if (!push) {
    return response.json({
      success: false,
    });
  }

  console.log("getPushStatus push", push);

  const validResponses = push.PushResponses.filter((item) => {
    return item.serviceResponse !== null;
  }).sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  let firstValidResponse = null;
  if (validResponses.length > 0) {
    firstValidResponse = validResponses[0];
  }

  response.json({
    success: true,
    pushData: JSON.parse(push.pushData),
    serviceRequest: JSON.parse(push.serviceRequest),
    serviceResponses: validResponses,
    firstValidResponse: firstValidResponse
      ? JSON.parse(firstValidResponse.serviceResponse)
      : null,
  });
};

const getPushStatusPoll = async (request, response) => {
  console.log(`response`, request.body);

  if (!pollingResponses[request.params.pushIdent]) {
    pollingResponses[request.params.pushIdent] = [];
  }

  pollingResponses[request.params.pushIdent].push(response);
};

const postPoll = (pushIdent, push) => {
  if (pollingResponses.hasOwnProperty(pushIdent)) {
    console.log(
      `postPoll`,
      pushIdent,
      push,
      pollingResponses[pushIdent].length
    );
    pollingResponses[pushIdent].map((response) => {
      response
        .json({
          success: true,
          pushData: JSON.parse(push.pushData),
          serviceRequest: JSON.parse(push.serviceRequest),
          serviceResponse: JSON.parse(push.serviceResponse),
        })
        .send()
        .end();
    });
    delete pollingResponses[pushIdent];
  }
};

module.exports = {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
};
