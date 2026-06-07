'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HeroAnswer extends Model {
    static associate(models) {
      HeroAnswer.belongsTo(models.Hero, { foreignKey: 'heroId' });         
      HeroAnswer.belongsTo(models.Question, { foreignKey: 'questionId', onDelete: 'CASCADE' }); 
      HeroAnswer.belongsTo(models.Answer, { foreignKey: 'answerId' });     
    }
  }
  
  HeroAnswer.init({
    heroId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    answerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'HeroAnswer',
  });
  return HeroAnswer;
};