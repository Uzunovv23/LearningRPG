"use strict";

const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

const isLogged = require("../middleware/isLogged");

router.get("/", isLogged, leaderboardController.getIndex);

module.exports = router;
