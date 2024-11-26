/* eslint-disable no-undef */
'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('players', 'tournament_id');
  },

  down: async (queryInterface, Sequelize) => {
  },
};
