"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Push extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Push.belongsTo(models.User, { as: "senderUser", foreignKey: "senderId" });
      Push.belongsTo(models.User, { as: "targetUser", foreignKey: "targetId" });

      Push.addScope("defaultScope", {
        // include: [{ model: models.User, as: "senderUser" }],
        // include: [{ model: models.User, as: "targetUser" }],
        attributes: {},
      });

      Push.addScope("byTarget", (userId) => ({
        where: { targetId: userId },
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
      pushTitle: DataTypes.STRING,
      pushBody: DataTypes.STRING,
      pushCategory: DataTypes.STRING,
      callbackUrl: DataTypes.STRING,
      // pushPayload: DataTypes.STRING,
      requestedData: DataTypes.STRING,
      responseData: DataTypes.STRING,
      handler: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Push",
    }
  );
  return Push;
};
