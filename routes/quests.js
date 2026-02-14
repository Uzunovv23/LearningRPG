var express = require("express");
var router = express.Router();
var questController = require("../controllers/questController");
var isLogged = require("../middleware/isLogged");

router.use(isLogged);

router.get("/", questController.index);
router.get("/:id", questController.show);

router.get("/:id/quizzes/:quizId", questController.showQuiz);

router.post("/:id/quizzes/:quizId/submit", questController.submitQuiz);

router.post("/use-joker", questController.useJoker);
router.post("/use-elixir", questController.useElixir);

module.exports = router;
