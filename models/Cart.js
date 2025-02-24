import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Product from "./Product.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "carts",
    timestamps: true,
  }
);

// Define relationships
User.hasMany(Cart, {
  foreignKey: "userId",
  as: "cartItems",
  onDelete: "CASCADE",
});
Cart.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });

Product.hasMany(Cart, {
  foreignKey: "productId",
  as: "cartItems",
  onDelete: "CASCADE",
});
Cart.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
});

export default Cart;
