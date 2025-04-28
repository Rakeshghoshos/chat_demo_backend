const { DataTypes } = require("sequelize");
const { sequelize } = require("./db");

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    socketId: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = {
  User,
};
