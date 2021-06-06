"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Users", "hash", Sequelize.STRING);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "hash");
  }
};
