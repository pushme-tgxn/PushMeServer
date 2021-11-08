const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const { User, UserAuthMethod } = require("../../models/index.js");

async function authenticate({ username, password }) {
  const user = await User.scope("withHash").findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.hash)))
    throw "Username or password is incorrect";

  // authentication successful
  const token = generateToken(user.id);
  return { ...omitHash(user.get()), token };
}

async function loginAuthMethod(method, methodIdent, methodData = {}) {
  let userAuthMethod = await UserAuthMethod.findOne({
    where: { method, methodIdent },
    raw: true,
    nest: true,
  });

  let userRecord, userId;
  if (!userAuthMethod) {
    // throw "Username does not exist";
    userRecord = await User.create({});
    console.log("userRecord", userRecord);
    userAuthMethod = await UserAuthMethod.create({
      userId: userRecord.id,
      method,
      methodIdent,
      methodData: JSON.stringify(methodData),
    });
    userId = userRecord.id;
  } else {
    userId = userAuthMethod.userId;
    userRecord = userAuthMethod.user;
  }

  console.log("sigining userAuthMethod", userId, userRecord);

  // authentication successful
  const token = generateToken(userId);
  return { ...omitHash(userRecord), token };
}

function generateToken(userId) {
  const secret = process.env.SECRET;

  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

async function getAll() {
  return await User.findAll();
}

async function getById(id) {
  return await getUser(id);
}

async function create(params) {
  // validate
  if (await User.findOne({ where: { username: params.username } })) {
    throw "Username or email is already taken";
  }

  // hash password
  if (params.password) {
    params.hash = await bcrypt.hash(params.password, 10);
  }

  console.log("create", params);

  // save user
  const createdUser = await User.create(params);
  console.log("createdUser", createdUser);
  return createdUser;
}

async function update(id, params) {
  const user = await getUser(id);

  // validate
  const usernameChanged = params.username && user.username !== params.username;
  if (
    usernameChanged &&
    (await User.findOne({ where: { username: params.username } }))
  ) {
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

async function getUser(id, scope = "default") {
  const user = await User.scope(scope).findByPk(id);
  if (!user) throw "User not found";
  return user;
}

function omitHash(user) {
  const { hash, ...userWithoutHash } = user;
  return userWithoutHash;
}

module.exports = {
  authenticate,
  loginAuthMethod,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};
