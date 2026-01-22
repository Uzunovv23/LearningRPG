var express = require("express");
var router = express.Router();

var userController = require("../controllers/userController");

var isLogged = require("../middleware/isLogged");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/my-hero", isLogged, userController.show);

module.exports = router;
