import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import { startDealScheduler } from "./utils/dealScheduler.js";
import { fileURLToPath } from "url";
import path from "path";
import Banner from "./models/Banner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
startDealScheduler();

// Enable CORS middleware

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/banner", bannerRoutes);
app.get("/", (req, res) => {
  res.send("Deal Scheduler is running!");
});

(async () => {
  try {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
    sequelize
      .sync({ force:false }) // set to true to reset the database
      .then(() => {
        console.log(" synced successfully!");
      })
      .catch((error) => {
        console.error("Unable to sync the database:", error);
      });

    //sync only one table
    // await Banner.sync({ alter: true});
    // console.log(" Banner table synced successfully!");

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
