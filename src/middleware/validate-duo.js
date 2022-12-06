const express = require("express");
const { createHmac } = require("crypto");

const { getTopicById, getTopicByKey } = require("../controllers/topic");

/**
 * Use the Duo method of authenticating requests.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const validateDuoSignature = async (request, response, next) => {
  const b64auth = (request.headers.authorization || "").split(" ")[1] || "";
  const strauth = Buffer.from(b64auth, "base64").toString();
  const splitIndex = strauth.indexOf(":");

  const topicKey = strauth.substring(0, splitIndex);
  const topicHash = strauth.substring(splitIndex + 1);

  const topic = await getTopicByKey(topicKey);
  console.log("topicKey", topicKey, topicHash);

  // if `NO_DUO_AUTH` is set, assume password is the secret
  if (process.env.NO_DUO_AUTH) {
    console.log("skipping duo signature validation, checking secret first");

    if (topicHash === topic.secretKey) {
      console.log("secret matches, continuing");
      request.topic = topic;
      return next();
    }
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

module.exports = { validateDuoSignature };
