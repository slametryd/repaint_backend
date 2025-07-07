import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const WarnaMotor = db.define(
  "warna_motor",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdateBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdateDate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "warna_motor", // Sesuaikan dengan nama tabel asli
    timestamps: true, // Nonaktifkan createdAt & updatedAt
    freezeTableName: true, // Jangan ubah nama tabel jadi jamak
  }
);

export default WarnaMotor;
