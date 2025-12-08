var express = require("express");
var router = express.Router();
var authController = require("../controllers/authController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Learning RPG", user: req.user });
});

router.get("/register", authController.showRegisterForm);
router.post("/register", authController.register);

router.get("/login", authController.showLoginForm);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

module.exports = router;
