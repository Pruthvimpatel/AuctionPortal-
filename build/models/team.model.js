"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.team = void 0;
const sequelize_1 = require("sequelize");
class Team extends sequelize_1.Model {
    static associate;
}
exports.default = Team;
const team = (sequelize, DataTypes) => {
    Team.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        budget: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Team',
        tableName: 'teams',
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Team.associate = models => {
        Team.hasMany(models.Player, { foreignKey: 'teamId' });
    };
    return Team;
};
exports.team = team;
