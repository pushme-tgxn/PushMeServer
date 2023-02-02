const express = require("express");

const { loginAuthPair, updateEmail, updatePassword, createEmailAuth } = require("../../services/auth");

const { appLogger } = require("../../middleware/logging.js");

const postLogin = async (request, response, next) => {
  try {
    const userLoggedIn = await loginAuthPair(request.body.email, request.body.password);

    if (userLoggedIn) {
      return response.json({ success: true, user: userLoggedIn });
    }

    response.json({ success: false, response: googleUserInfo });
  } catch (error) {
    next(error);
  }
};

const postRegister = async (request, response, next) => {
  try {
    const user = await createEmailAuth(request.body.email, request.body.password);

    response.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const postEmailUpdate = async (request, response, next) => {
  try {
    appLogger.debug(request.user.id);

    await updateEmail(request.user.id, request.body.email);

    response.json({ success: true, userId: request.user.id });
  } catch (error) {
    next(error);
  }
};

const postUpdatePassword = async (request, response, next) => {
  try {
    appLogger.debug(request.user.id);

    await updatePassword(request.user.id, request.body.password);

    response.json({ success: true, userId: request.user.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postLogin,
  postRegister,
  postEmailUpdate,
  postUpdatePassword,
};
