import { Sequelize } from "sequelize";

const isProduction = process.env.NODE_ENV === "production";

// Pilih host & port otomatis:
const dbHost = isProduction
  ? process.env.DB_HOST_PROD
  : process.env.DB_HOST_DEV;
const dbPort = isProduction
  ? process.env.DB_PORT_PROD
  : process.env.DB_PORT_DEV;

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
  }
);

export default db;
