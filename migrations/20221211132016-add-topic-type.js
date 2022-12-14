"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Topics", "type", {
      type: Sequelize.STRING,
      defaultValue: "webhook",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Topics", "type");
  },
};
