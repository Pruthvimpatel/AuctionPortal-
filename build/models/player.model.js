"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.player = void 0;
const sequelize_1 = require("sequelize");
class Player extends sequelize_1.Model {
    static associate;
}
exports.default = Player;
const player = (sequelize, DataTypes) => {
    Player.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'),
            allowNull: false,
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        basePrice: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Player',
        tableName: 'players',
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Player.associate = models => {
        // Define associations (e.g., Player belongs to Team)
        Player.belongsTo(models.Team, { foreignKey: 'teamId' });
    };
    return Player;
};
exports.player = player;
