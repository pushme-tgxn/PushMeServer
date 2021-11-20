"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.User, { as: "user", foreignKey: "userId" });

      Device.belongsToMany(models.Topic, {
        as: "topics",
        through: "TopicDevices",
      });

      Device.addScope("defaultScope", {
        // include: [
        //   {
        //     model: models.Topic,
        //     as: "topics",
        //     // attributes: { exclude: ["devices"] },
        //   },
        // ],
        attributes: { exclude: ["token"] },
      });

      Device.addScope("withTopics", () => ({
        include: [
          {
            model: models.Topic,
            as: "topics",
            // attributes: { exclude: ["devices"] },
          },
        ],
        attributes: {},
      }));

      Device.addScope("byUser", (userId) => ({
        include: [
          {
            model: models.Topic,
            as: "topics",
            // attributes: { exclude: ["devices"] },
          },
        ],
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
