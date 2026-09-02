const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");

// ==========================================
// Create Razorpay Order
// ==========================================

const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Only customers can make payments
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can make payments",
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Find booking belonging to logged-in customer
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Booking should be accepted before payment
    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Payment can only be made for an accepted booking",
      });
    }

    // Prevent duplicate payment
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed",
      });
    }

    // Razorpay amount is in paise
    const amount = Math.round(booking.price * 100);

    const options = {
      amount,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    // Save Razorpay order ID
    booking.razorpayOrderId = order.id;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      bookingId: booking._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Payment Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// ==========================================
// Verify Razorpay Payment
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // Find booking belonging to logged-in customer
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify signature
    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      booking.paymentStatus = "failed";

      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Make sure order belongs to this booking
    if (
      booking.razorpayOrderId !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment order",
      });
    }

    // Payment successful
    booking.paymentStatus = "paid";
    booking.razorpayPaymentId =
      razorpay_payment_id;
    booking.paidAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};