const User = require("../models/User");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const Review = require("../models/Review");

// ===============================
// Get Admin Dashboard Stats
// ===============================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "customer",
    });

    const totalProviders = await User.countDocuments({
      role: "provider",
    });

    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const acceptedBookings = await Booking.countDocuments({
      status: "accepted",
    });

    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const rejectedBookings = await Booking.countDocuments({
      status: "rejected",
    });

    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    const totalRevenueResult = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$price",
          },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0
        ? totalRevenueResult[0].total
        : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        pendingBookings,
        acceptedBookings,
        completedBookings,
        rejectedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(
      "Admin Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get All Providers
// ===============================
const getProviders = async (req, res) => {
  try {
    const providers = await Provider.find()
      .populate(
        "user",
        "-password"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error(
      "Get Providers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Verify / Unverify Provider
// ===============================
const verifyProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await Provider.findById(
      providerId
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const user = await User.findById(
      provider.user
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Provider user not found",
      });
    }

    user.isVerified = !user.isVerified;

    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isVerified
        ? "Provider verified successfully"
        : "Provider verification removed",
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error(
      "Verify Provider Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get All Customers
// ===============================
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "Get Customers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Activate / Deactivate Customer
// ===============================
const toggleCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findOne({
      _id: customerId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.isActive = !customer.isActive;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: customer.isActive
        ? "Customer activated successfully"
        : "Customer deactivated successfully",
      isActive: customer.isActive,
    });
  } catch (error) {
    console.error(
      "Toggle Customer Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get All Bookings
// ===============================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(
        "customer",
        "fullName email phone"
      )
      .populate(
        "provider",
        "fullName email phone"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get All Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get All Reviews - Admin
// ===============================
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate(
        "customer",
        "fullName email profileImage"
      )
      .populate(
        "provider",
        "fullName email profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get All Reviews Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboardStats,
  getProviders,
  verifyProvider,
  getCustomers,
  toggleCustomerStatus,
  getAllBookings,
  getAllReviews,
};