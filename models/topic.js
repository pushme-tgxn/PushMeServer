"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsToMany(models.Device, {
        as: "devices",
        through: "TopicDevices",
      });

      Topic.addScope("defaultScope", {
        // include: [{ model: models.Device, as: "devices" }],
        attributes: { exclude: ["secretKey", "TopicDevices"] },
      });

      Topic.addScope("withDevices", {
        include: [{ model: models.Device, as: "devices" }],
        attributes: {},
      });

      Topic.addScope("byUser", (userId) => ({
        include: [{ model: models.Device, as: "devices" }],
        where: { userId },
        attributes: {},
      }));

      Topic.addScope("bySecret", (secretKey) => ({
        include: [{ model: models.Device, as: "devices" }],
        where: { secretKey },
        attributes: {},
      }));
    }
  }
  Topic.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      topicKey: DataTypes.STRING,
      secretKey: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Topic",
    }
  );
  return Topic;
};
