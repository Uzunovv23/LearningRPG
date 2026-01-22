var express = require("express");
var router = express.Router();
var shopController = require("../controllers/shopController");

var isLogged = require("../middleware/isLogged");

router.get("/", isLogged, shopController.getShop);

router.post("/buy/:id", isLogged, shopController.buyItem);

module.exports = router;
