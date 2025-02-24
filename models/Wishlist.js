import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Product from "./Product.js";

const Wishlist = sequelize.define(
  "Wishlist",
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
  },
  {
    tableName: "wishlists",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "productId"], 
      }
    ],
  }
);

// Define associations
Wishlist.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });
Wishlist.belongsTo(Product, { foreignKey: "productId", as: "product", onDelete: "CASCADE" });
User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlists", onDelete: "CASCADE" });
Product.hasMany(Wishlist, { foreignKey: "productId", as: "wishlistedBy", onDelete: "CASCADE" });

export default Wishlist;