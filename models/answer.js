'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      Answer.belongsTo(models.Question, { foreignKey: 'questionId', onDelete: 'CASCADE' });
    }
  }
  
  Answer.init({
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
      allowNull: false
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Answer',
  });
  return Answer;
};