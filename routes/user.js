const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

const authorize = require('../middleware/authorize')
const userService = require('../lib/user');

router.post('/login', async (request, response, next) => {
  console.log(request.body);
  try {
    const user = await userService.authenticate(request.body)
    response.json(user)
  } catch(error) {
    next(error);
  }
});

router.get('/verify', async (request, response, next) => {
  console.log("verify", request.body);
  try {
    const token = jwt.verify(request.body, secret);
    console.log("token verify", token);
    response.json(token)
  } catch(error) {
    next(error);
  }
});

router.post('/register', register);

router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}