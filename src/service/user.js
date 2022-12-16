const {
  User,
  UserAuthMethod,
  Device,
  Topic,
  Push,
  PushResponse,
} = require("../../models/index.js");

const { listPushesForUserId } = require("./push.js");

const deleteUserAccount = async (userId) => {
  // delete pushes
  const usersPushes = await listPushesForUserId(userId);
  await Push.destroy({ where: { targetUserId: userId } });

  // delete push responses
  for (const push of usersPushes) {
    await PushResponse.destroy({ where: { pushId: push.id } });
  }

  // delete topics
  await Topic.destroy({ where: { userId } });

  // delete devices
  await Device.destroy({ where: { userId } });

  // delete user auth methods
  await UserAuthMethod.destroy({ where: { userId } });

  // delete user
  await User.destroy({ where: { id: userId } });
};

module.exports = {
  deleteUserAccount,
};
