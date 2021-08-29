"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Push", "response", Sequelize.STRING);
    await queryInterface.addColumn("Push", "request", Sequelize.STRING);
    await queryInterface.addColumn("Push", "handler", Sequelize.STRING);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Push", "response");
    await queryInterface.removeColumn("Push", "request");
    await queryInterface.removeColumn("Push", "handler");
  },
};
