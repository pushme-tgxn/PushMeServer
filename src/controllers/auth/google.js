const { User, UserAuthMethod } = require("../../../models/index.js");

const { generateToken } = require("./token");

async function loginAuthMethod(method, methodIdent, methodData = {}) {
  let userAuthMethod = await UserAuthMethod.findOne({
    where: { method, methodIdent },
    raw: true,
    nest: true,
  });

  // create google account
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

module.exports = {
  loginAuthMethod,
};
