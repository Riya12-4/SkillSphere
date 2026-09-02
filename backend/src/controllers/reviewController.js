const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");

// ===============================
// Create Review
// ===============================
const createReview = async (req, res) => {
  try {
    const {
      bookingId,
      rating,
      comment,
    } = req.body;

    // Check required fields
    if (!bookingId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Booking, rating and comment are required",
      });
    }

    // Only customers can review
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit reviews",
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in customer
    if (
      booking.customer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    // Only completed bookings can be reviewed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Create review
    const review = await Review.create({
      customer: req.user._id,
      provider: booking.provider,
      booking: bookingId,
      rating,
      comment: comment || "",
    });

    // Update provider rating
    const provider = await Provider.findOne({
      user: booking.provider,
    });

    if (provider) {
      const newTotalReviews =
        provider.totalReviews + 1;

      const newRating =
        (
          (provider.rating * provider.totalReviews) +
          Number(rating)
        ) / newTotalReviews;

      provider.rating = Number(
        newRating.toFixed(1)
      );

      provider.totalReviews =
        newTotalReviews;

      await provider.save();
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ===============================
// Get Provider Reviews
// ===============================
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({
      provider: providerId,
    })
      .populate(
        "customer",
        "fullName profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error(
      "Get Provider Reviews Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Delete Review - Admin
// ===============================
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Find provider before deleting review
    const provider = await Provider.findOne({
      user: review.provider,
    });

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Recalculate provider rating
    if (provider) {
      const remainingReviews = await Review.find({
        provider: review.provider,
      });

      if (remainingReviews.length === 0) {
        provider.rating = 0;
        provider.totalReviews = 0;
      } else {
        const totalRating = remainingReviews.reduce(
          (sum, item) => sum + item.rating,
          0
        );

        provider.rating = Number(
          (totalRating / remainingReviews.length).toFixed(1)
        );

        provider.totalReviews =
          remainingReviews.length;
      }

      await provider.save();
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  deleteReview,
};