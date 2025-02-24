import cron from 'node-cron';
import Deal from "../models/Deal.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";

const handleExpiredDeals = async () => {
  try {
    const now = new Date();
    const expiredDeals = await Deal.findAll({
      where: {
        endDate: { [Op.lt]: now }, 
      },
    });

    for (const deal of expiredDeals) {
      const product = await Product.findByPk(deal.productId);
      if (product) {
        product.dealOfTheDay = false;
        product.dealDiscountPercentage = 0;
        await product.save();
      }

      // Option 1: Delete the expired deal
      await deal.destroy();

      // Option 2: Update the expired deal (e.g., mark it as inactive)
      // deal.isActive = false;
      // await deal.save();
    }

    console.log(`Processed ${expiredDeals.length} expired deals.`);
  } catch (error) {
    console.error("Error processing expired deals:", error);
  }
};

// Function to start the cron job
export const startDealScheduler = () => {
  // Schedule the cron job to run every hour
  cron.schedule('0 * * * *', handleExpiredDeals); // Runs at the start of every hour

  console.log("Cron job scheduled to check for expired deals.");
};