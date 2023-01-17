const express = require("express");

const { postGenerateToken } = require("../../controllers/auth/google");

const router = express.Router();

router.post("/token", postGenerateToken);

module.exports = { router };
