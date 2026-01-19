var express = require("express");
var router = express.Router();
var shopController = require("../controllers/shopController");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.get("/", isAuthenticated, shopController.getShop);

router.get("/seed", isAuthenticated, shopController.seedShop);

router.post("/buy/:id", isAuthenticated, shopController.buyItem);

module.exports = router;
