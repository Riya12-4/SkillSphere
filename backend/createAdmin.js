require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const adminEmail = "admin@skillsphere.com";
    const adminPassword = "Admin@12345";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    const admin = await User.create({
      fullName: "SkillSphere Admin",
      email: adminEmail,
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("✅ Admin created successfully!");
    console.log("--------------------------------");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Creation Error:", error);
    process.exit(1);
  }
};

createAdmin();