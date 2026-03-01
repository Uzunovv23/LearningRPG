"use strict";

const express = require("express");
const router = express.Router();
const arenaController = require("../controllers/arenaController");
const isLogged = require("../middleware/isLogged");

router.get("/", isLogged, arenaController.getLobby);
router.get("/matchmake", isLogged, arenaController.getMatchmaking);
router.post("/challenge", isLogged, arenaController.postChallenge);
router.post("/accept", isLogged, arenaController.postAccept);
router.post("/decline", isLogged, arenaController.postDecline);
router.get("/battle/:duelId", isLogged, arenaController.getBattle);
router.post("/submit-battle", isLogged, arenaController.postSubmitBattle);
router.get("/result/:duelId", isLogged, arenaController.getBattleResult);

module.exports = router;
