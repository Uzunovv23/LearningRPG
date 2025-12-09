'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HeroQuizTaken extends Model {
    static associate(models) {
      HeroQuizTaken.belongsTo(models.Hero, { foreignKey: 'heroId' });
      HeroQuizTaken.belongsTo(models.Quiz, { foreignKey: 'quizId' });   
      HeroQuizTaken.belongsTo(models.Score, { foreignKey: 'scoreId' });
    }
  }
  
  HeroQuizTaken.init({
    heroId: {
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    scoreId: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false, 
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'HeroQuizTaken',
  });
  return HeroQuizTaken;
};