/* eslint-disable no-undef */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('team_owners', 'points', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1000000,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('team_owners', 'points');
  }
};
