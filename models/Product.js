// models/Product.js
import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    judul: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    deskripsi: DataTypes.STRING,
    picture: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LastUpdateBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LastUpdateDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "product",
    timestamps: true,
  }
);

export default Product;
