"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Pushes", "response", Sequelize.TEXT);
    await queryInterface.addColumn("Pushes", "request", Sequelize.TEXT);
    await queryInterface.addColumn("Pushes", "handler", Sequelize.STRING);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Pushes", "response");
    await queryInterface.removeColumn("Pushes", "request");
    await queryInterface.removeColumn("Pushes", "handler");
  },
};
