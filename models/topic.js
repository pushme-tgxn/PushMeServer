"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.hasMany(models.Device, { as: "devices" });

      // Device.hasMany(models.Topic, {
      //   as: "topics",
      //   foreignKey: "deviceId",
      // });

      Topic.addScope("byUser", (userId) => ({
        // include: [{ model: models.Topic, as: "topics" }],
        where: { userId },
        attributes: {},
      }));

      Topic.addScope("bySecret", (secretKey) => ({
        include: [{ model: models.Device, as: "device", attributes: {} }],
        where: { secretKey },
        attributes: {},
      }));
    }
  }
  Topic.init(
    {
      userId: DataTypes.INTEGER,
      // deviceId: DataTypes.STRING,
      secretKey: DataTypes.STRING,
      callbackUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Topic",
    }
  );
  return Topic;
};
