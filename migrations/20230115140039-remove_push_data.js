"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pushes", "pushData");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pushes", "pushData", {
      type: Sequelize.TEXT,
    });
  },
};
