'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Tokens',
      'name',
       Sequelize.STRING
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Tokens',
      'name'
    );
  }
};
