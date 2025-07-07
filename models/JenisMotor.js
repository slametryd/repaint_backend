import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const JenisMotor = db.define(
  "jenis_motor",
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
    tableName: "jenis_motor", // Sesuaikan dengan nama tabel asli
    timestamps: true, // Nonaktifkan createdAt & updatedAt
    freezeTableName: true, // Jangan ubah nama tabel jadi jamak
  }
);

export default JenisMotor;
