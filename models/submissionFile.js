"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubmissionFile extends Model {
    static associate(models) {
      SubmissionFile.belongsTo(models.HomeworkSubmission, {
        foreignKey: "submissionId",
      });
    }
  }

  SubmissionFile.init(
    {
      fileName: { type: DataTypes.STRING, allowNull: false },
      filePath: { type: DataTypes.STRING, allowNull: false },
      mimeType: { type: DataTypes.STRING },
      submissionId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "SubmissionFile",
    },
  );
  return SubmissionFile;
};
