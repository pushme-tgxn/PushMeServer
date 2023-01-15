"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Devices", "pushData");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pushes", "pushData", {
      type: Sequelize.TEXT,
    });
  },
};
