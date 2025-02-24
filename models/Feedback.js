import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Product from "./Product.js";

const Feedback = sequelize.define(
  "Feedback",
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "productId"], // Ensure a user can only leave one feedback per product
      },
    ],
  }
);

// Define associations
Feedback.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });
Feedback.belongsTo(Product, { foreignKey: "productId", as: "product", onDelete: "CASCADE" });
User.hasMany(Feedback, { foreignKey: "userId", as: "feedbacks", onDelete: "CASCADE" });
Product.hasMany(Feedback, { foreignKey: "productId", as: "feedbacks", onDelete: "CASCADE" });

export default Feedback;