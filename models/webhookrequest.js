"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WebhookRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WebhookRequest.init(
    {
      webhookId: DataTypes.STRING,
      webhookRequest: DataTypes.STRING,
      callbackResponse: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "WebhookRequest",
    }
  );
  return WebhookRequest;
};
