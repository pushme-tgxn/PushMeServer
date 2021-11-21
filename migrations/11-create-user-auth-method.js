"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserAuthMethods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      method: {
        type: Sequelize.STRING,
      },
      methodIdent: {
        type: Sequelize.STRING,
      },
      methodSecret: {
        type: Sequelize.TEXT,
      },
      methodData: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addConstraint("UserAuthMethods", {
      type: "UNIQUE",
      fields: ["userId", "method", "methodIdent"],
      name: "user_method_ident",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserAuthMethods");
  },
};
