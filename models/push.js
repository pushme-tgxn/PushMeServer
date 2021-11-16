"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Push extends Model {
    static associate(models) {
      // Push.belongsTo(models.User, { as: "senderUser", foreignKey: "senderId" });
      Push.belongsTo(models.User, {
        as: "targetUser",
        foreignKey: "targetUserId",
      });

      Push.addScope("defaultScope", {
        // include: [{ model: models.User, as: "senderUser" }],
        // include: [{ model: models.User, as: "targetUser" }],
        attributes: {},
      });

      Push.addScope("byTargetUser", (userId) => ({
        where: { targetUserId: userId },
        // attributes: {},
      }));

      Push.addScope("bySender", (userId) => ({
        where: { senderId: userId },
        // attributes: {},
      }));
    }
  }
  Push.init(
    {
      // senderId: DataTypes.INTEGER,
      targetUserId: DataTypes.INTEGER,
      pushData: DataTypes.TEXT,
      pushPayload: DataTypes.TEXT,
      serviceRequest: DataTypes.TEXT,
      serviceResponse: DataTypes.TEXT,
      // handler: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Push",
    }
  );
  return Push;
};
