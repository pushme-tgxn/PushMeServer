"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Device, { as: "devices", foreignKey: "userId" });
      User.hasMany(models.Push, {
        as: "userPushes",
        foreignKey: "targetUserId",
      });

      User.hasMany(models.UserAuthMethod, {
        as: "authMethods",
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      // email: DataTypes.STRING,
      // username: DataTypes.STRING,
      // hash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      // defaultScope: {
      //   attributes: { exclude: ["hash"] },
      // },
      // scopes: {
      //   // include hash with this scope
      //   withHash: { attributes: {} },
      // },
    }
  );
  return User;
};
