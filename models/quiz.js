'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      Quiz.belongsTo(models.Quest, { foreignKey: 'questId', onDelete: 'CASCADE' });
      Quiz.hasMany(models.Question, { foreignKey: 'quizId', onDelete: 'CASCADE' });
    }
  }
  
  Quiz.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false 
    },
    questId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};