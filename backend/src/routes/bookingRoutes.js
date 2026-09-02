const express = require("express");
const router = express.Router();

const {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

// Create a new booking
router.post("/", protect, createBooking);

// Get logged-in customer's bookings
router.get("/my-bookings", protect, getCustomerBookings);

// Get logged-in provider's bookings
router.get("/provider-bookings", protect, getProviderBookings);

// Accept / Reject / Complete booking
router.put("/:bookingId/status", protect, updateBookingStatus);

module.exports = router;