"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Pushes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pushIdent: {
        type: Sequelize.STRING,
        unique: true,
      },
      targetUserId: {
        type: Sequelize.INTEGER,
      },
      pushData: {
        type: Sequelize.TEXT,
      },
      pushPayload: {
        type: Sequelize.TEXT,
      },
      serviceRequest: {
        type: Sequelize.TEXT,
      },
      // serviceResponse: {
      //   type: Sequelize.TEXT,
      // },
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
    await queryInterface.dropTable("Pushes");
  },
};
