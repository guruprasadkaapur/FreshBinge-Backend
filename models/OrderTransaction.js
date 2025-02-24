import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Order from "./Order.js";
import Product from "./Product.js";

const OrderTransaction = sequelize.define(
  "OrderTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Order, key: "id" },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Product, key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING, // Store payment transaction ID
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false, // Total amount for this transaction
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false, // Credit Card, UPI, PayPal, etc.
    },
  },
  {
    tableName: "order_transactions",
    timestamps: true,
  }
);
Order.hasOne(OrderTransaction, { foreignKey: "orderId", as: "transaction" , onUpdate: 'CASCADE', onDelete: 'CASCADE'});
OrderTransaction.belongsTo(Order, { foreignKey: "orderId", as: "order", onUpdate: 'CASCADE', onDelete: 'CASCADE'});

OrderTransaction.belongsTo(Product, {
  foreignKey: "productId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.hasMany(OrderTransaction, {
  foreignKey: "productId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


export default OrderTransaction;
