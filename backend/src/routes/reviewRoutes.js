const express = require("express");
const router = express.Router();

const {
  createReview,
  getProviderReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

// Customer creates a review
router.post("/", protect, createReview);

// Get reviews of a provider
router.get("/provider/:providerId", getProviderReviews);

module.exports = router;