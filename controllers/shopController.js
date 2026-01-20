const { ShopItem, Hero, Purchase, Quest } = require("../models");
const { Op } = require("sequelize");

exports.getShop = async (req, res) => {
  try {
    const quests = await Quest.findAll({
      where: { isActive: true },
    });

    const items = await ShopItem.findAll({
      where: {
        isActive: true,
        questId: { [Op.ne]: null },
      },
      include: [Quest],
      order: [["cost", "DESC"]],
    });

    const { status } = req.query;
    let message = null;
    let messageType = null;

    if (status === "success") {
      message = `Успешна покупка! Учителят ще бъде уведомен и ще нанесе оценката.`;
      messageType = "success";
    } else if (status === "no_funds") {
      message = "Нямаш достатъчно Knowcoins за тази покупка!";
      messageType = "danger";
    } else if (status === "error") {
      message = "Възникна грешка при транзакцията.";
      messageType = "danger";
    }

    res.render("shop/index", {
      title: "Магазин за награди",
      quests: quests,
      items: items,
      hero: req.user ? req.user.Hero : null,
      alertMessage: message,
      alertType: messageType,
    });
  } catch (error) {
    console.error("Shop Error:", error);
    res
      .status(500)
      .render("error", { message: "Грешка при зареждане на магазина." });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const user = req.user;

    if (!user || !user.Hero) {
      return res.redirect("/shop?status=error");
    }

    const hero = user.Hero;
    const item = await ShopItem.findByPk(itemId);

    if (!item) {
      return res.redirect("/shop?status=error");
    }

    if (hero.knowcoins < item.cost) {
      return res.redirect("/shop?status=no_funds");
    }

    // --- ТРАНЗАКЦИЯ ---
    hero.knowcoins -= item.cost;
    await hero.save();

    await Purchase.create({
      userId: user.id,
      shopItemId: item.id,
      status: "pending",
    });

    res.redirect(`/shop?status=success`);
  } catch (error) {
    console.error("Buy Error:", error);
    res.redirect("/shop?status=error");
  }
};

exports.seedShop = async (req, res) => {
  try {
    const quests = await Quest.findAll({ where: { isActive: true } });

    if (quests.length === 0) {
      return res.send(
        "Няма активни куестове! Първо създайте куестове от админ панела, за да заредите магазина.",
      );
    }

    let createdCount = 0;

    for (const quest of quests) {
      const items = [
        {
          title: `Оценка Отличен (6)`,
          description: `Важи за предмета: ${quest.title}`,
          cost: 1000,
          icon: "fa-certificate text-success",
          questId: quest.id,
        },
        {
          title: `Оценка Мн. Добър (5)`,
          description: `Важи за предмета: ${quest.title}`,
          cost: 600,
          icon: "fa-star text-primary",
          questId: quest.id,
        },
        {
          title: `Оценка Добър (4)`,
          description: `Важи за предмета: ${quest.title}`,
          cost: 300,
          icon: "fa-check-circle text-info",
          questId: quest.id,
        },
        {
          title: `Оценка Среден (3)`,
          description: `Важи за предмета: ${quest.title}`,
          cost: 100,
          icon: "fa-life-ring text-warning",
          questId: quest.id,
        },
      ];

      for (const item of items) {
        await ShopItem.findOrCreate({
          where: { title: item.title, questId: item.questId },
          defaults: item,
        });
        createdCount++;
      }
    }

    res.send(`
        <h1>Магазинът е зареден успешно!</h1>
        <p>Добавени/Проверени са стоки за ${quests.length} куеста.</p>
        <a href="/shop">Към магазина</a>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Seed Error");
  }
};
