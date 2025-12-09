"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      // Връзките са супер!
      Quiz.belongsTo(models.Quest, { foreignKey: 'questId', onDelete: 'CASCADE' }); 
      Quiz.hasMany(models.QuizAnswer, { foreignKey: 'quizId', onDelete: 'CASCADE' });
    }
  }

  Quiz.init(
    {
      question: {
        type: DataTypes.TEXT,
        allowNull: false 
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 10, 
        allowNull: false
      },
      questId: {
        type: DataTypes.INTEGER,
        allowNull: false 
      },
    },
    {
      sequelize,
      modelName: "Quiz",
    }
  );
  return Quiz;
};