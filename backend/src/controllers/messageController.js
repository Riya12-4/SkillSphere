const Message = require("../models/Message");

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { receiver, booking, text } = req.body;

    if (!receiver || !booking || !text) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      booking,
      text,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Chat Messages
const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const messages = await Message.find({
      booking: bookingId,
    })
      .populate("sender", "fullName role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};