const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getProviders,
  verifyProvider,
  getCustomers,
  toggleCustomerStatus,
  getAllBookings,
  getAllReviews,
} = require("../controllers/adminController");

const {
  deleteReview,
} = require("../controllers/reviewController");
// ===============================
// Admin Dashboard
// ===============================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboardStats
);

// ===============================
// Get All Providers
// ===============================

router.get(
  "/providers",
  protect,
  adminOnly,
  getProviders
);

// ===============================
// Verify / Unverify Provider
// ===============================

router.put(
  "/providers/:providerId/verify",
  protect,
  adminOnly,
  verifyProvider
);

// ===============================
// Get All Customers
// ===============================

router.get(
  "/customers",
  protect,
  adminOnly,
  getCustomers
);

// ===============================
// Activate / Deactivate Customer
// ===============================

router.put(
  "/customers/:customerId/status",
  protect,
  adminOnly,
  toggleCustomerStatus
);

// ===============================
// Get All Bookings
// ===============================

router.get(
  "/bookings",
  protect,
  adminOnly,
  getAllBookings
);

// ===============================
// Get All Reviews
// ===============================

router.get(
  "/reviews",
  protect,
  adminOnly,
  getAllReviews
);

// ===============================
// Delete Review - Admin
// ===============================

router.delete(
  "/reviews/:reviewId",
  protect,
  adminOnly,
  deleteReview
);

module.exports = router;