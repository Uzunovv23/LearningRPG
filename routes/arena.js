"use strict";

const express = require("express");
const router = express.Router();
const arenaController = require("../controllers/arenaController");
const isLogged = require("../middleware/isLogged");

router.get("/", isLogged, arenaController.getLobby);

module.exports = router;
