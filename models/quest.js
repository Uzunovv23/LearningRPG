"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quest extends Model {
    static associate(models) {
      Quest.hasMany(models.Quiz, { foreignKey: 'questId', onDelete: 'CASCADE' });
      Quest.belongsToMany(models.Hero, { through: models.HeroQuest, foreignKey: 'questId' }); 
      Quest.hasMany(models.Score, { foreignKey: 'questId' });
      Quest.hasMany(models.ShopItem, { foreignKey: "questId" });
    }
  }

  Quest.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      xpReward: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
      },
      requiredGradesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 3, 
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "Quest",
    }
  );
  return Quest;
};
