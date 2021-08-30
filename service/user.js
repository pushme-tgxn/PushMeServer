const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const db = require("../models/index.js");

const secret = process.env.SECRET;

async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });
  
  console.log("usder", user);

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username or email is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
  
  console.log("create", params);

    // save user
    const createdUser = await db.User.create(params);
  return createdUser;
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
