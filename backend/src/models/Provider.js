const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    skills: [
      {
        type: String,
      },
    ],

    bio: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    // ===============================
    // Provider GPS Location
    // ===============================
    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },

    serviceRadius: {
      type: Number,
      default: 10,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    portfolio: [portfolioSchema],

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Provider",
  providerSchema
);