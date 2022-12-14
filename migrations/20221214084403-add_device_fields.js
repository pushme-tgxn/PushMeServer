"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Devices", "nativeToken", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Devices", "type", {
      type: Sequelize.ENUM("android", "ios", "web"),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Devices", "nativeToken");
    await queryInterface.removeColumn("Devices", "type");
  },
};
