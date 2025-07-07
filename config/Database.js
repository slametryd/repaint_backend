import { Sequelize } from "sequelize";

const db = new Sequelize(`repaint`, `root`, ``, {
  host: "localhost",
  dialect: "mysql",
  port: 4306,
});

export default db;
