"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pushes", "serviceType", {
      type: Sequelize.ENUM("expo", "fcm"),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pushes", "serviceType");
  },
};
