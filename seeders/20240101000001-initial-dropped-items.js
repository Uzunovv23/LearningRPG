"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingItems = await queryInterface.rawSelect(
      "DroppedItems",
      { where: { name: "Еликсир на паметта" } },
      ["id"],
    );

    if (!existingItems) {
      return queryInterface.bulkInsert("DroppedItems", [
        {
          name: "Еликсир на паметта",
          description:
            "Показва верния отговор на един въпрос по избор по време на тест.",
          icon: "fa-flask",
          type: "quiz_help",
          rarity: "common",
          effectValue: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Жокера",
          description:
            "Елиминира грешни отговори и те оставя с един верен и един грешен (50/50).",
          icon: "fa-dice-d20",
          type: "quiz_help",
          rarity: "rare",
          effectValue: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Свитък на Мъдростта",
          description:
            "Дава ти двойно XP и двойни Coins за един успешно преминат тест.",
          icon: "fa-scroll",
          type: "booster",
          rarity: "epic",
          effectValue: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ръкавицата на Мидас",
          description: "Удвоява получените Coins (парички) от един тест.",
          icon: "fa-hand-holding-usd",
          type: "booster",
          rarity: "rare",
          effectValue: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Пясъчен часовник",
          description: "Удължава срока на едно активно домашно с 24 часа.",
          icon: "fa-hourglass-half",
          type: "time_bender",
          rarity: "epic",
          effectValue: 24,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Билет за Закъснение",
          description:
            "Позволява предаване на домашно след крайния срок без наказание.",
          icon: "fa-ticket-alt",
          type: "time_bender",
          rarity: "legendary",
          effectValue: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("DroppedItems", null, {});
  },
};
