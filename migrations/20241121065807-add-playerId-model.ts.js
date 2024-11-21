/* eslint-disable no-undef */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('auctions', 'player_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('auctions', 'player_id');
  },
};
