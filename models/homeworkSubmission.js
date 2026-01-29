"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HomeworkSubmission extends Model {
    static associate(models) {
      HomeworkSubmission.belongsTo(models.User, { foreignKey: "userId" });
      HomeworkSubmission.belongsTo(models.Homework, { foreignKey: "homeworkId" });
      HomeworkSubmission.hasMany(models.SubmissionFile, { foreignKey: "submissionId", onDelete: 'CASCADE' });
    }
  }

  HomeworkSubmission.init(
    {
      submissionText: {
        type: DataTypes.TEXT, 
        allowNull: true,
      },     
      grade: {
        type: DataTypes.INTEGER, 
        allowNull: true,
      },
      feedback: {
        type: DataTypes.TEXT, 
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HomeworkSubmission",
    }
  );
  return HomeworkSubmission;
};