const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const User = require("../models/User");

// ===============================
// Create Booking
// ===============================
const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      service,
      description,
      bookingDate,
    } = req.body;

    if (!providerId || !service || !bookingDate) {
      return res.status(400).json({
        success: false,
        message:
          "Provider, service and booking date are required",
      });
    }

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can create bookings",
      });
    }

    const provider = await Provider.findOne({
      user: providerId,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ===============================
    // Check Provider Account
    // ===============================

    const providerUser = await User.findById(
      provider.user
    );

    if (!providerUser) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found",
      });
    }

    // Provider must be verified
    if (!providerUser.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "This provider has not been verified by SkillSphere yet.",
      });
    }

    // Provider account must be active
    if (!providerUser.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This provider account is currently inactive.",
      });
    }

    // Provider must be available
    if (!provider.availability) {
      return res.status(400).json({
        success: false,
        message:
          "Provider is currently unavailable",
      });
    }

    // ===============================
    // Create Booking
    // ===============================

    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      service,
      description: description || "",
      bookingDate,
      price: provider.price,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Customer Bookings
// ===============================
const getCustomerBookings = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message:
          "Only customers can view their bookings",
      });
    }

    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate(
        "provider",
        "fullName email phone profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get Customer Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Provider Bookings
// ===============================
const getProviderBookings = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only providers can view provider bookings",
      });
    }

    const bookings = await Booking.find({
      provider: req.user._id,
    })
      .populate(
        "customer",
        "fullName email phone profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get Provider Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Update Booking Status
// ===============================
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only providers can update booking status",
      });
    }

    const allowedStatuses = [
      "accepted",
      "rejected",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use accepted, rejected or completed",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      provider: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error(
      "Update Booking Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
};