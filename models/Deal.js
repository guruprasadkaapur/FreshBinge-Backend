import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Product from "./Product.js";

const Deal = sequelize.define(
  "Deal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    discountPercentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    specialOfferDetails: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDealOfTheDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "deals",
    timestamps: true,
  }
);

Product.hasMany(Deal, {
  foreignKey: "productId",
  as: "deals",
  onDelete: "CASCADE",
});
Deal.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
});

export default Deal;