const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const { User, UserAuthMethod } = require("../../models/index.js");

async function loginAuthPair(email, password) {
  // const user = await User.scope("withHash").findOne({ where: { username } });

  let userAuthMethod = await UserAuthMethod.scope("withSecret").findOne({
    where: { method: "email", methodIdent: email },
    raw: true,
    nest: true,
  });

  if (
    !userAuthMethod ||
    !(await bcrypt.compare(password, userAuthMethod.methodSecret))
  )
    throw "Username or password is incorrect";

  const user = await getUser(userAuthMethod.userId);

  console.log("sigining userAuthMethod", userAuthMethod.userId, user);

  // authentication successful
  const token = generateToken(user.id);
  return { ...user, token };
}

async function createEmailAuth(email, password) {
  let userAuthMethod = await UserAuthMethod.findOne({
    where: { method: "email", methodIdent: email },
    raw: true,
    nest: true,
  });

  // validate
  if (userAuthMethod) {
    throw "email is already taken";
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 10);
  console.log("ceate", email, passwordHash);

  const userRecord = await User.create({});
  userAuthMethod = await UserAuthMethod.create({
    userId: userRecord.id,
    method: "email",
    methodIdent: email,
    // methodData: JSON.stringify(methodData),
    methodSecret: passwordHash,
  });

  // save user
  // const createdUser = await User.create(params);

  console.log("createdUser", userRecord, userAuthMethod);
  return userRecord;
}

async function updateEmailAuthPassword(id, params) {
  const user = await getUser(id);

  // validate username manually !!!!
  const usernameChanged = params.username && user.username !== params.username;
  if (
    usernameChanged &&
    (await User.findOne({ where: { username: params.username } }))
  ) {
    throw 'Username "' + params.username + '" is already taken';
  }

  // // hash password if it was entered
  // if (params.password) {
  //   params.hash = await bcrypt.hash(params.password, 10);
  // }

  // copy params to user and save
  Object.assign(user, params);
  await user.save();

  return omitHash(user.get());
}

// @TODO split create/login code
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
  return { ...userRecord, token };
}

function generateToken(userId) {
  const secret = process.env.SECRET;

  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

// async function getAll() {
//   return await User.findAll();
// }

// async function getById(id) {
//   return await getUser(id);
// }

// async function _delete(id) {
//   const user = await getUser(id);
//   await user.destroy();
// }

// helper functions

async function getUser(id, scope = "defaultScope") {
  const user = await User.scope(scope).findByPk(id, { raw: true });
  if (!user) throw "User not found";
  return user;
}

// function omitHash(user) {
//   const { hash, ...userWithoutHash } = user;
//   return userWithoutHash;
// }

module.exports = {
  loginAuthPair,
  createEmailAuth,
  updateEmailAuthPassword,
  loginAuthMethod,
  // create,
  // update,
  // delete: _delete,
};
