/* eslint-disable no-undef */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add playerId column
    await queryInterface.addColumn('tournaments', 'player_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add teamId column
    await queryInterface.addColumn('tournaments', 'team_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    // Remove playerId column
    await queryInterface.removeColumn('tournaments', 'player_id');

    // Remove teamId column
    await queryInterface.removeColumn('tournaments', 'team_id');
  }
};
