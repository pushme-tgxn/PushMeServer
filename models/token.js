"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Token.belongsTo(models.User, { as: "user", foreignKey: "userId" });

      Token.hasMany(models.Webhook, { as: "webhooks", foreignKey: "tokenId" });

      Token.addScope("defaultScope", {
        // include: [{ model: models.Webhook, as: "webhook" }],
        attributes: { exclude: ["token"] },
      });

      Token.addScope("byUser", (userId) => ({
        include: [{ model: models.Webhook, as: "webhooks" }],
        where: { userId },
        attributes: {},
      }));

      Token.addScope("withToken", (tokenId) => ({
        where: { id: tokenId },
        attributes: {},
      }));
    }
  }
  Token.init(
    {
      token: DataTypes.STRING,
      name: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Token",
      // defaultScope: {
      //   attributes: { exclude: ["token"] },
      // },
      // scopes: {
      //   // include token with this scope
      //   withToken: { attributes: {} },
      // },
    }
  );
  return Token;
};
