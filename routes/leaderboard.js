var express = require("express");
var router = express.Router();
var leaderboardController = require("../controllers/leaderboardController");

router.get("/", leaderboardController.getIndex);

module.exports = router;
