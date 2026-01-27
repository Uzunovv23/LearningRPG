var express = require("express");
var router = express.Router();

var userController = require("../controllers/userController");
var fileController = require("../controllers/fileController");

var isLogged = require("../middleware/isLogged");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/my-hero", isLogged, userController.show);
router.get("/download/material/:id", isLogged, fileController.downloadMaterial);
router.get("/homework/:id", isLogged, userController.getHomework);

module.exports = router;
