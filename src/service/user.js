const {
  User,
  Device,
  Topic,
  Push,
  PushResponse,
} = require("../../models/index.js");

const deleteUserAccount = async (userId) => {
  await Topic.destroy({ where: { userId } });
  await Device.destroy({ where: { userId } });

  // TODO cleanup user data
  //   await Push.destroy({ where: { userId } });
  //   await PushResponse.destroy({ where: { userId: userId } });

  await User.destroy({ where: { id: userId } });
  //   const push = await Push.scope("withResponses").findOne({
  //     where: { pushIdent },
  //   });
  //   if (!push) {
  //     return null;
  //   }
  //   return push.toJSON();
};

module.exports = {
  deleteUserAccount,
};
