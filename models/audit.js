"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Audit extends Model {
    static associate(models) {
      Audit.belongsTo(models.User, { as: "user", foreignKey: "userId" });
    }
  }
  Audit.init(
    {
      userId: DataTypes.INTEGER,
      message: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Audit",
    }
  );
  return Audit;
};
