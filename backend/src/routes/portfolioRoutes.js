const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addPortfolioItem,
  getMyPortfolio,
  getProviderPortfolio,
  deletePortfolioItem,
} = require("../controllers/portfolioController");

// ===============================
// Add Portfolio Item
// ===============================
router.post(
  "/",
  protect,
  addPortfolioItem
);

// ===============================
// Get Logged-in Provider Portfolio
// ===============================
router.get(
  "/my-portfolio",
  protect,
  getMyPortfolio
);

// ===============================
// Delete Portfolio Item
// ===============================
router.delete(
  "/:portfolioId",
  protect,
  deletePortfolioItem
);

// ===============================
// Get Any Provider's Portfolio
// ===============================
router.get(
  "/provider/:providerId",
  getProviderPortfolio
);

module.exports = router;