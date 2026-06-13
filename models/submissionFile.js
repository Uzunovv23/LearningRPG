"use strict";
const { Model } = require("sequelize");
const fs = require("fs");
const path = require("path");

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
      hooks: {
        beforeDestroy: (file, options) => {
          if (file.filePath) {
            const absolutePath = path.join(__dirname, "../private_uploads", file.filePath);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          }
        }
      }
    },
  );
  return SubmissionFile;
};