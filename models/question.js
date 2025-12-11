'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.Quiz, { foreignKey: 'quizId', onDelete: 'CASCADE' });
      Question.hasMany(models.Answer, { foreignKey: 'questionId', onDelete: 'CASCADE' });
    }
  }
  Question.init({
    text: {
      type: DataTypes.TEXT,
      allowNull: false 
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 10, 
      allowNull: false
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};