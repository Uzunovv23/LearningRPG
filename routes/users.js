var express = require("express");
var router = express.Router();

var userController = require("../controllers/userController");
var fileController = require("../controllers/fileController");

var upload = require("../middleware/upload");

var isLogged = require("../middleware/isLogged");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/my-hero", isLogged, userController.show);
router.get("/download/material/:id", isLogged, fileController.downloadMaterial);
router.get("/homework/:id", isLogged, userController.getHomework);

router.post(
  "/homework/:id/submit",
  isLogged,
  upload.single("solutionFile"),
  userController.submitHomework,
);

module.exports = router;
