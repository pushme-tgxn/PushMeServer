const express = require("express");

const { authorize } = require("../middleware/authorize");

const { deleteUserAccount } = require("../services/user");

const router = express.Router();

router.get("/", authorize(), async (request, response, next) => {
  try {
    response.json({
      success: true,
      user: request.user,
      methods: request.methods,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/", authorize(), async (request, response, next) => {
  try {
    await deleteUserAccount(request.user.id);
    response.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
