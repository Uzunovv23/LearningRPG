const { Quest, Quiz, Question, Answer, Hero, HeroQuest } = require('../models');

exports.index = async (req, res) => {
  try {
    const quests = await Quest.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']] 
    });

    res.render("quests/index", {
      title: "Налични Мисии",
      quests: quests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при зареждане на куестовете.");
  }
};

exports.show = async (req, res) => {
  try {
    const quest = await Quest.findByPk(req.params.id, {
      include: [{
        model: Quiz,
        include: [{
          model: Question,
          include: [{
            model: Answer,
            attributes: ['id', 'text'] 
          }]
        }]
      }]
    });

    if (!quest) {
      return res.status(404).render('error', { message: 'Куестът не е намерен.' });
    }

    res.render('quests/show', { 
      title: quest.title, 
      quest: quest 
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Грешка при зареждане на куеста.');
  }
};