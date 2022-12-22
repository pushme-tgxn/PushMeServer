const bcrypt = require("bcryptjs");

const { User, UserAuthMethod } = require("../../../models/index.js");

const { generateToken } = require("./token");

// define api error messages
const errorMessages = {
  emailpasswordIncorrect: "email or password is incorrect",
  passwordIsRequired: "password is required",
  emailIsRequired: "email is required",
  emailMethodNotFound: "email method not found",
  emailAlreadyRegistered: "email already registered",
  emailNotChanged: "email not changed",
  userNotFound: "user not found",
};

async function loginAuthPair(email, password) {
  let userAuthMethod = await UserAuthMethod.scope("withSecret").findOne({
    where: { method: "email", methodIdent: email },
  });

  if (
    !userAuthMethod ||
    !(await bcrypt.compare(password, userAuthMethod.methodSecret))
  )
    throw errorMessages.emailpasswordIncorrect;

  const user = await getUser(userAuthMethod.userId);

  console.log("sigining userAuthMethod", userAuthMethod.userId, user);

  // authentication successful
  const token = generateToken(user.id);
  return { ...user, token };
}

// gets the uderauthmethod dbo
async function findAuthMethodByEmail(email) {
  const userAuthMethod = await UserAuthMethod.findOne({
    where: { method: "email", methodIdent: email },
    // raw: true,
    // nest: true,
  });
  if (!userAuthMethod) return null;
  return userAuthMethod;
}
async function findEmailAuthMethodForUserId(userId) {
  const userAuthMethod = await UserAuthMethod.findOne({
    where: { method: "email", userId },
    // raw: true,
    // nest: true,
  });
  if (!userAuthMethod) return null;
  return userAuthMethod;
}

async function createEmailAuth(email, password) {
  let userAuthMethod = await findAuthMethodByEmail(email);
  console.log("userAuthMethod", userAuthMethod);

  // validate
  if (email == "" || email == null) {
    throw errorMessages.emailIsRequired;
  }

  if (password == "" || password == null) {
    throw errorMessages.passwordIsRequired;
  }

  if (userAuthMethod) {
    throw errorMessages.emailAlreadyRegistered;
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 10);
  console.log("create user", email, passwordHash);

  // TODO use transaction so we can rollback if creating the UserAuthMethod fails
  const userRecord = await User.create({});
  userAuthMethod = await UserAuthMethod.create({
    userId: userRecord.id,
    method: "email",
    methodIdent: email,
    methodSecret: passwordHash,
  });

  console.log(
    "createdUser",
    userRecord.id,
    userAuthMethod.id,
    userAuthMethod.userId
  );
  return userRecord;
}

async function updateEmail(userId, newEmail) {
  const userAuthMethod = await findEmailAuthMethodForUserId(userId);

  // validate this user has email login
  if (!userAuthMethod) {
    throw errorMessages.emailMethodNotFound;
  }

  // validate
  if (newEmail == "" || newEmail == null) {
    throw errorMessages.emailIsRequired;
  }

  // check email is not already set
  if (userAuthMethod.methodIdent == newEmail) {
    throw errorMessages.emailNotChanged;
  }

  // validate email is not already taken
  const userByEmail = await findAuthMethodByEmail(newEmail);
  if (userByEmail) {
    throw errorMessages.emailAlreadyRegistered;
  }

  console.debug("updateEmail OK", userId, newEmail);

  userAuthMethod.methodIdent = newEmail;
  await userAuthMethod.save();
}

async function updatePassword(userId, newPassword) {
  const userAuthMethod = await findEmailAuthMethodForUserId(userId);

  // validate this user has email login
  if (!userAuthMethod) {
    throw errorMessages.emailMethodNotFound;
  }

  // validate
  if (newPassword == "" || newPassword == null) {
    throw errorMessages.passwordIsRequired;
  }

  // copy params to user and save
  userAuthMethod.methodSecret = await bcrypt.hash(newPassword, 10);

  console.debug("updatePassword OK", userId);

  await userAuthMethod.save();
}

async function getUser(id, scope = "defaultScope") {
  const user = await User.scope(scope).findByPk(id, { raw: true });
  if (!user) {
    throw errorMessages.userNotFound;
  }

  return user;
}

module.exports = {
  loginAuthPair,
  createEmailAuth,
  updateEmail,
  updatePassword,
};
