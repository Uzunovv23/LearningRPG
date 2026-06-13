"use strict";
const { Model } = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = (sequelize, DataTypes) => {
  class HomeworkMaterial extends Model {
    static associate(models) {
      HomeworkMaterial.belongsTo(models.Homework, { foreignKey: "homeworkId" });
    }
  }

  HomeworkMaterial.init(
    {
      fileName: {
        type: DataTypes.STRING,
        allowNull: false, 
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false, 
      },
      mimeType: {
        type: DataTypes.STRING, 
      },
      homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HomeworkMaterial",
      hooks: {
        beforeDestroy: (material, options) => {
          if (material.filePath) {
            const absolutePath = path.join(__dirname, "../private_uploads", material.filePath);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          }
        }
      }
    }
  );
  return HomeworkMaterial;
};