const express = require("express");

const { authorize } = require("../../middleware/authorize");

const {
  postLogin,
  postRegister,
  postEmailUpdate,
  postUpdatePassword,
} = require("../../controllers/auth/email");

const router = express.Router();

router.post("/login", postLogin);
router.post("/register", postRegister);

router.post("/email", authorize(), postEmailUpdate);
router.post("/password", authorize(), postUpdatePassword);

module.exports = { router };
