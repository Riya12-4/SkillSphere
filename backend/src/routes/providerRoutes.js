const express = require("express");

const router = express.Router();

const {
  searchProvidersBySkill,
  getProviderProfile,
  updateProviderProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getNearbyProviders,
} = require("../controllers/providerController");

const protect = require("../middleware/authMiddleware");

// ===============================
// Search providers by skill
// ===============================
router.post("/search", searchProvidersBySkill);

// ===============================
// Get nearby providers
// ===============================
router.get("/nearby", protect, getNearbyProviders);

// ===============================
// Get logged-in provider profile
// ===============================
router.get("/profile", protect, getProviderProfile);

// ===============================
// Update logged-in provider profile
// ===============================
router.put("/profile", protect, updateProviderProfile);

// ===============================
// Add portfolio item
// ===============================
router.post(
  "/portfolio",
  protect,
  addPortfolioItem
);

// ===============================
// Delete portfolio item
// ===============================
router.delete(
  "/portfolio/:portfolioId",
  protect,
  deletePortfolioItem
);

module.exports = router;