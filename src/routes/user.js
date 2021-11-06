const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const authorize = require("../middleware/authorize");
const userService = require("../service/user");

router.post("/login", async (request, response, next) => {
  console.log(request.body);
  try {
    const user = await userService.authenticate(request.body);
    response.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.get("/verify", async (request, response, next) => {
  const token = request.headers.authorization.split(" ")[1];
  console.log("verify", token);
  try {
    const token1 = jwt.verify(token, secret);
    console.log("token verify", token1);
    response.json(token1);
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  userService
    .create(req.body)
    .then((user) =>
      res.json({ success: true, user, message: "Registration successful" })
    )
    .catch(next);
});

router.get("/", authorize(), async (req, res, next) => {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
});

router.get("/current", authorize(), async (req, res, next) => {
  res.json({ user: req.user, ureq: req.UserReq, message: "You are logged in" });
});

router.get("/:id", authorize(), async (req, res, next) => {
  userService
    .getById(req.params.id)
    .then((user) => res.json(user))
    .catch(next);
});

router.put("/:id", authorize(), async (req, res, next) => {
  userService
    .update(req.params.id, req.body)
    .then((user) => res.json(user))
    .catch(next);
});

router.delete("/:id", authorize(), async (req, res, next) => {
  userService
    .delete(req.params.id)
    .then(() => res.json({ message: "User deleted successfully" }))
    .catch(next);
});

module.exports = router;
