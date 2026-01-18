var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/my-hero", isAuthenticated, userController.getMyHero);

module.exports = router;
