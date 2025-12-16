var express = require("express");
var router = express.Router();
var questController = require("../controllers/questController");

var isLogged = require("../middleware/isLogged");

router.use(isLogged);

router.get("/", questController.index);
router.get("/:id", questController.show);

router.post("/:id/submit", questController.submit);

module.exports = router;
