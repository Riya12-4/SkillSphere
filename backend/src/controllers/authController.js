const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ===============================
// Register User
// ===============================
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Check if all fields are provided
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // If Provider → create provider profile
    if (role === "provider") {
      await Provider.create({
        user: user._id,
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    res.status(201).json({
  success: true,
  message: "Registration Successful",
  token,
  user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
    isActive: user.isActive,
  },
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Login User
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check selected role against actual account role
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Please select ${user.role} to continue.`,
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Send response without password
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
};