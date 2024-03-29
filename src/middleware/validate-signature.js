const express = require("express");
const { createHmac } = require("crypto");

const { getTopicByKey } = require("../services/topic");

const { appLogger } = require("./logging.js");

/**
 * Use the Duo method of authenticating requests.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
const validateSignature = async (request, response, next) => {
  const b64auth = (request.headers.authorization || "").split(" ")[1] || "";
  const strauth = Buffer.from(b64auth, "base64").toString();
  const splitIndex = strauth.indexOf(":");

  const topicKey = strauth.substring(0, splitIndex);
  const topicHash = strauth.substring(splitIndex + 1);

  const topic = await getTopicByKey(topicKey);
  appLogger.debug("topicKey", topicKey, topicHash);

  // if `NO_TRIO_AUTH` is set, assume password is the secret
  if (process.env.NO_TRIO_AUTH) {
    appLogger.warn("skipping signature validation, checking secret first");

    if (topicHash === topic.secretKey) {
      appLogger.debug("secret matches, continuing");
      request.topic = topic;
      return next();
    }
  }

  // payload to hash for
  const authHashString = [
    request.headers.date,
    request.method,
    request.hostname,
    `/auth/v2${request.path}`,
    request.method == "GET" ? request.headers.query : request.rawBody,
  ].join("\n");

  const calculatedHash = createHmac("sha512", topic.secretKey) // the golang api uses sha512, docs are wrong
    .update(authHashString)
    .digest("hex");

  // test hash matched

  if (calculatedHash === topicHash) {
    appLogger.debug("hash matched");
    request.topic = topic;
    next();
  } else {
    appLogger.error("hash mismatch", calculatedHash, topicHash);
    return response.json({
      error: "signature hash mismatch",
    });
  }
};

module.exports = { validateSignature };
