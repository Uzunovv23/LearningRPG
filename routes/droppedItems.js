const express = require("express");
const router = express.Router();
const droppedItemController = require("../controllers/droppedItemController");
const isLogged = require("../middleware/isLogged");

router.get("/", isLogged, droppedItemController.index);

module.exports = router;
