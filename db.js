const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./chat.db",
  logging: false,
});
module.exports = {
  sequelize,
};
