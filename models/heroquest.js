'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HeroQuest extends Model {

    static associate(models) {
      HeroQuest.belongsTo(models.Hero, { foreignKey: 'heroId' });
      HeroQuest.belongsTo(models.Quest, { foreignKey: 'questId' });
    }
  }
  
  HeroQuest.init({
    heroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Heroes',
        key: 'id'
      }
    },
    questId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quests',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'started' 
    }
  }, {
    sequelize,
    modelName: 'HeroQuest',
  });
  
  return HeroQuest;
};