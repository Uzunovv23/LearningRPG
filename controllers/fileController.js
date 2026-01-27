const path = require("path");
const fs = require("fs");
const { HomeworkMaterial } = require("../models");

exports.downloadMaterial = async (req, res) => {
  try {
    const fileId = req.params.id;

    const material = await HomeworkMaterial.findByPk(fileId);

    if (!material) {
      return res.status(404).send("Файлът не е намерен.");
    }

    const filePath = path.join(
      __dirname,
      "../private_uploads",
      material.filePath,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Файлът липсва на сървъра.");
    }

    res.download(filePath, material.fileName);
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).send("Грешка при сваляне.");
  }
};
