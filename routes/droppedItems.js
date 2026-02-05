const express = require("express");
const router = express.Router();
const droppedItemController = require("../controllers/droppedItemController");

router.get("/", droppedItemController.index);

module.exports = router;