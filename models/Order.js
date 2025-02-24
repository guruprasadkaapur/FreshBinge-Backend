import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";

const Order = sequelize.define(
  "Order",
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
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipping",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensure shipping address is not empty
      },
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensure payment method is not empty
      },
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    paranoid: true, // Soft delete enabled
  }
);

// Define associations
Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});
User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
  onDelete: "CASCADE",
});

export default Order;
