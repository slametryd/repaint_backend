// models/Booking.js
import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";
import Product from "./Product.js"; // Import untuk relasi

const Booking = db.define(
  "Booking",
  {
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    jenis_motor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warna: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "product", // 🔍 nama tabel, bukan nama model
        key: "id",
      },
    },
    total_harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_pembayaran: {
      type: DataTypes.STRING,
      allowNull: true, // bisa "pending", "settlement", dll
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Midtrans perlu order_id unik
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noWa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdateBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdateDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "booking",
    timestamps: true,
  }
);

// Relasi: Satu booking terkait ke satu product
Booking.belongsTo(Product, { foreignKey: "produkId" });

export default Booking;
