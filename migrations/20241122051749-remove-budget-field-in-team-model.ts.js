/* eslint-disable no-undef */
'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('teams', 'budget');
  },

  down: async () => {
  },
};
