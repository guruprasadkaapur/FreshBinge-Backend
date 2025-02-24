import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import SubCategory from "./SubCategory.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    originalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountPercentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    price: {
      type: DataTypes.VIRTUAL,
      get() {
        const originalPrice = this.getDataValue("originalPrice") || 0;
        const discountPercentage = this.getDataValue("discountPercentage") || 0;
        const dealDiscountPercentage = this.getDataValue("dealDiscountPercentage") || 0;

        const isDealOfTheDay = this.getDataValue("dealOfTheDay") || false;

        const totalDiscountPercentage = isDealOfTheDay
          ? discountPercentage + dealDiscountPercentage
          : discountPercentage;

        const finalDiscountPercentage = Math.min(totalDiscountPercentage, 100);

        const discountAmount = (originalPrice * finalDiscountPercentage) / 100;
        const finalPrice = originalPrice - discountAmount;

        return Math.max(finalPrice, 0); 
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    additionalInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SubCategory,
        key: "id",
      },
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    dealOfTheDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dealDiscountPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

SubCategory.hasMany(Product, {
  foreignKey: "subCategoryId",
  as: "products",
  onDelete: "CASCADE",
});
Product.belongsTo(SubCategory, {
  foreignKey: "subCategoryId",
  as: "subCategory",
  onDelete: "CASCADE",
});

export default Product;