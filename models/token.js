module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    token: DataTypes.STRING,
    deviceId: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {});
  return Token;
};
