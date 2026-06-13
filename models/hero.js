"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hero extends Model {
    static associate(models) {
      Hero.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });  
      Hero.belongsToMany(models.Quest, { through: models.HeroQuest, foreignKey: "heroId", onDelete: "CASCADE" });
      Hero.hasMany(models.HeroAnswer, { foreignKey: "heroId", onDelete: "CASCADE" });
      Hero.hasMany(models.HeroBalance, { foreignKey: "heroId", onDelete: "CASCADE" });
      Hero.hasMany(models.Duel, { as: 'Initiator', foreignKey: 'initiatorId', onDelete: 'CASCADE' });
      Hero.hasMany(models.Duel, { as: 'Opponent', foreignKey: 'opponentId', onDelete: 'CASCADE' });
  }
  }

  Hero.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      knowcoins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      health: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      mana: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      avatarIcon: {
        type: DataTypes.STRING,
        defaultValue: 'fa-user-graduate', 
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Hero",
    }
  );
  return Hero;
};
