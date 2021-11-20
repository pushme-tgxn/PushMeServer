"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAuthMethod extends Model {
    static associate(models) {
      UserAuthMethod.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });

      UserAuthMethod.addScope("defaultScope", {
        include: [
          {
            model: models.User,
            as: "user",
            attributes: { exclude: ["methodSecret"] },
          },
        ],
      });
    }
  }
  UserAuthMethod.init(
    {
      userId: DataTypes.INTEGER,
      method: DataTypes.STRING,
      methodIdent: DataTypes.STRING,
      methodSecret: DataTypes.TEXT,
      methodData: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "UserAuthMethod",
      scopes: {
        // include secret with this scope
        withSecret: { attributes: {} },
      },
    }
  );
  return UserAuthMethod;
};
