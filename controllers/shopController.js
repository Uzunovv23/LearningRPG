const {
  ShopItem,
  Hero,
  HeroBalance,
  Purchase,
  Quest,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

exports.getShop = async (req, res) => {
  try {
    const user = req.user;
    const hero = user ? user.Hero : null;

    const quests = await Quest.findAll({
      where: { isActive: true },
      attributes: ["id", "title", "requiredGradesCount"],
    });

    // 2. Взимаме стоките
    const items = await ShopItem.findAll({
      where: {
        isActive: true,
        questId: { [Op.ne]: null },
      },
      include: [{ model: Quest, attributes: ["title"] }],
      order: [["cost", "DESC"]],
    });

    // 3. Обработка на балансите
    let balances = {};

    if (hero) {
      const heroBalances = await HeroBalance.findAll({
        where: { heroId: hero.id },
      });

      heroBalances.forEach((b) => {
        balances[b.questId] = b.amount;
      });
    }

    // 4. Обработка на съобщения
    const { status, questId } = req.query;

    let message = null;
    let messageType = null;

    const messages = {
      success: {
        text: "Успешна покупка! Учителят ще бъде уведомен.",
        type: "success",
      },
      no_funds: {
        text: "Нямаш достатъчно Knowcoins за този предмет!",
        type: "danger",
      },
      error: {
        text: "Възникна техническо грешка при транзакцията.",
        type: "danger",
      },
      invalid: { text: "Невалидна заявка.", type: "warning" },
    };

    if (status && messages[status]) {
      message = messages[status].text;
      messageType = messages[status].type;
    }

    const activeQuestId = questId ? parseInt(questId) : null;

    res.render("shop/index", {
      title: "Магазин за награди",
      quests,
      items,
      hero,
      balances,
      alertMessage: message,
      alertType: messageType,
      activeQuestId: activeQuestId,
    });
  } catch (error) {
    console.error("Shop Controller Error (getShop):", error);
    res
      .status(500)
      .render("error", { message: "Грешка при зареждане на магазина." });
  }
};

exports.buyItem = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const itemId = req.params.id;
    const user = req.user;

    if (!user || !user.Hero) {
      await t.rollback();
      return res.redirect("/shop?status=error");
    }

    const hero = user.Hero;

    const item = await ShopItem.findByPk(itemId, { transaction: t });

    if (!item || !item.questId) {
      await t.rollback();
      return res.redirect("/shop?status=invalid");
    }

    const redirectUrl = (status) =>
      `/shop?status=${status}&questId=${item.questId}`;

    let balanceRecord = await HeroBalance.findOne({
      where: {
        heroId: hero.id,
        questId: item.questId,
      },
      transaction: t,
    });

    const currentAmount = balanceRecord ? balanceRecord.amount : 0;

    if (currentAmount < item.cost) {
      await t.rollback();
      return res.redirect(redirectUrl("no_funds"));
    }

    balanceRecord.amount -= item.cost;
    await balanceRecord.save({ transaction: t });

    await Purchase.create(
      {
        userId: user.id,
        shopItemId: item.id,
        status: "pending",
      },
      { transaction: t },
    );

    await t.commit();

    console.log(
      `Purchase successful: User ${user.id} bought Item ${item.id} for Quest ${item.questId}`,
    );

    res.redirect(redirectUrl("success"));
  } catch (error) {
    await t.rollback();
    console.error("Transaction Error (buyItem):", error);
    res.redirect("/shop?status=error");
  }
};
