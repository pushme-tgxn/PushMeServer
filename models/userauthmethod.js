"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAuthMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
            attributes: { exclude: ["token"] },
          },
        ],
      });
    }
  }
  UserAuthMethod.init(
    {
      method: DataTypes.STRING,
      methodIdent: DataTypes.STRING,
      methodData: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserAuthMethod",
    }
  );
  return UserAuthMethod;
};
