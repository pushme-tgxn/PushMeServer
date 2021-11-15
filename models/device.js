"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.User, { as: "user", foreignKey: "userId" });

      // Device.hasMany(models.Topic, {
      //   as: "topics",
      //   foreignKey: "deviceId",
      // });

      Device.addScope("defaultScope", {
        // include: [{ model: models.Topic, as: "topic" }],
        attributes: { exclude: ["token"] },
      });

      Device.addScope("byUser", (userId) => ({
        // include: [{ model: models.Topic, as: "topics" }],
        where: { userId },
        attributes: {},
      }));

      Device.addScope("byDeviceId", (deviceId) => ({
        where: { id: deviceId },
        attributes: {},
      }));
    }
  }
  Device.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Device",
    }
  );
  return Device;
};
