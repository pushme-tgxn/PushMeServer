"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PushResponse extends Model {
    static associate(models) {
      PushResponse.belongsTo(models.Push, {
        as: "pushResponse",
        foreignKey: "pushId",
      });

      PushResponse.addScope("byPushId", (pushId) => ({
        limit: 1,
        where: { pushId },
        order: [["id", "DESC"]],
      }));
    }
  }
  PushResponse.init(
    {
      pushId: DataTypes.INTEGER,
      serviceResponse: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "PushResponse",
    }
  );
  return PushResponse;
};
