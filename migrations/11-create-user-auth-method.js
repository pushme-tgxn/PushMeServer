"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserAuthMethods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      method: {
        type: Sequelize.STRING,
        unique: true,
      },
      methodIdent: {
        type: Sequelize.STRING,
        unique: true,
      },
      methodSecret: {
        type: Sequelize.TEXT,
      },
      methodData: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserAuthMethods");
  },
};
