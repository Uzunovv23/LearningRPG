'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuizAnswer extends Model {
    static associate(models) {
      QuizAnswer.belongsTo(models.Quiz, { foreignKey: 'quizId', onDelete: 'CASCADE' });
    }
  }

  QuizAnswer.init({
    answer: {
      type: DataTypes.STRING,
      allowNull: false 
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false 
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'QuizAnswer',
  });
  return QuizAnswer;
};