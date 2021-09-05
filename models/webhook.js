"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Webhook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Webhook.belongsTo(models.Token, { as: "token", foreignKey: "tokenId" });

      Webhook.hasMany(models.WebhookRequest, {
        as: "requests",
        foreignKey: "webhookId",
      });

      Webhook.addScope("bySecret", (secretKey) => ({
        include: [{ model: models.Token, as: "token", attributes: {} }],
        where: { secretKey },
        attributes: {},
      }));
    }
  }
  Webhook.init(
    {
      tokenId: DataTypes.STRING,
      secretKey: DataTypes.STRING,
      callbackUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Webhook",
    }
  );
  return Webhook;
};
