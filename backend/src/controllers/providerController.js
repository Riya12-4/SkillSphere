const Provider = require("../models/Provider");

// ===============================
// Search Providers by Skill
// ===============================
const searchProvidersBySkill = async (req, res) => {
  try {
    const { skill } = req.body;

    if (!skill || !skill.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill is required",
      });
    }

    const providers = await Provider.find({
      skills: {
        $regex: skill,
        $options: "i",
      },
      availability: true,
    })
      .populate({
        path: "user",
        select:
          "fullName email phone profileImage isVerified isActive role",
        match: {
          isVerified: true,
          isActive: true,
          role: "provider",
        },
      })
      .sort({
        rating: -1,
        completedJobs: -1,
      });

    const verifiedProviders = providers.filter(
      (provider) => provider.user !== null
    );

    return res.status(200).json({
      success: true,
      count: verifiedProviders.length,
      skill,
      providers: verifiedProviders,
    });
  } catch (error) {
    console.error("Provider Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Logged-in Provider Profile
// ===============================
const getProviderProfile = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can access this profile",
      });
    }

    const provider = await Provider.findOne({
      user: req.user._id,
    }).populate(
      "user",
      "fullName email phone profileImage isVerified"
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error("Get Provider Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Update Provider Profile
// ===============================
const updateProviderProfile = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only providers can update provider profiles",
      });
    }

    const {
      skills,
      bio,
      experience,
      price,
      location,
      latitude,
      longitude,
      serviceRadius,
      availability,
    } = req.body;

    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    if (skills !== undefined) {
      provider.skills = skills;
    }

    if (bio !== undefined) {
      provider.bio = bio;
    }

    if (experience !== undefined) {
      provider.experience = experience;
    }

    if (price !== undefined) {
      provider.price = price;
    }

    if (location !== undefined) {
      provider.location = location;
    }

    if (latitude !== undefined) {
      provider.latitude = Number(latitude);
    }

    if (longitude !== undefined) {
      provider.longitude = Number(longitude);
    }

    if (serviceRadius !== undefined) {
      provider.serviceRadius = Number(serviceRadius);
    }

    if (availability !== undefined) {
      provider.availability = availability;
    }

    await provider.save();

    const updatedProvider = await Provider.findById(
      provider._id
    ).populate(
      "user",
      "fullName email phone profileImage isVerified"
    );

    return res.status(200).json({
      success: true,
      message:
        "Provider profile updated successfully",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error(
      "Update Provider Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Add Portfolio Item
// ===============================
const addPortfolioItem = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only providers can add portfolio items",
      });
    }

    const { title, description, image } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Portfolio title is required",
      });
    }

    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    provider.portfolio.push({
      title: title.trim(),
      description: description?.trim() || "",
      image: image?.trim() || "",
    });

    await provider.save();

    return res.status(201).json({
      success: true,
      message:
        "Portfolio item added successfully",
      portfolio: provider.portfolio,
    });
  } catch (error) {
    console.error("Add Portfolio Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Delete Portfolio Item
// ===============================
const deletePortfolioItem = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only providers can delete portfolio items",
      });
    }

    const { portfolioId } = req.params;

    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const itemExists = provider.portfolio.some(
      (item) =>
        item._id.toString() === portfolioId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found",
      });
    }

    provider.portfolio =
      provider.portfolio.filter(
        (item) =>
          item._id.toString() !== portfolioId
      );

    await provider.save();

    return res.status(200).json({
      success: true,
      message:
        "Portfolio item deleted successfully",
      portfolio: provider.portfolio,
    });
  } catch (error) {
    console.error(
      "Delete Portfolio Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Find Nearby Providers
// ===============================
const getNearbyProviders = async (req, res) => {
  try {
    const { latitude, longitude, skill } = req.query;

    // -------------------------------
    // Validate customer location
    // -------------------------------
    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required",
      });
    }

    const userLatitude = Number(latitude);
    const userLongitude = Number(longitude);

    if (
      Number.isNaN(userLatitude) ||
      Number.isNaN(userLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers",
      });
    }

    if (
      userLatitude < -90 ||
      userLatitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude must be between -90 and 90",
      });
    }

    if (
      userLongitude < -180 ||
      userLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be between -180 and 180",
      });
    }

    // -------------------------------
    // Find available providers
    // -------------------------------
    const query = {
      availability: true,
      latitude: {
        $exists: true,
      },
      longitude: {
        $exists: true,
      },
    };

    // Optional skill filter
    if (skill && skill.trim()) {
      query.skills = {
        $regex: skill.trim(),
        $options: "i",
      };
    }

    const providers = await Provider.find(query)
      .populate({
        path: "user",
        select:
          "fullName email phone profileImage isVerified isActive role",
        match: {
          isVerified: true,
          isActive: true,
          role: "provider",
        },
      })
      .sort({
        rating: -1,
        completedJobs: -1,
      });

    // -------------------------------
    // Haversine Distance Calculation
    // -------------------------------
    const toRadians = (degrees) => {
      return degrees * (Math.PI / 180);
    };

    const calculateDistance = (
      lat1,
      lon1,
      lat2,
      lon2
    ) => {
      const earthRadius = 6371;

      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) *
          Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c =
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        );

      return earthRadius * c;
    };

    // -------------------------------
    // Filter by Provider Service Radius
    // -------------------------------
    const nearbyProviders = providers
      .filter((provider) => provider.user !== null)
      .map((provider) => {
        const providerLatitude =
          Number(provider.latitude);

        const providerLongitude =
          Number(provider.longitude);

        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          providerLatitude,
          providerLongitude
        );

        return {
          ...provider.toObject(),
          distance: Number(distance.toFixed(2)),
        };
      })
      .filter(
        (provider) =>
          provider.distance <=
          Number(provider.serviceRadius || 0)
      )
      .sort(
        (a, b) => a.distance - b.distance
      );

    return res.status(200).json({
      success: true,
      count: nearbyProviders.length,
      providers: nearbyProviders,
    });
  } catch (error) {
    console.error(
      "Nearby Providers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Exports
// ===============================
module.exports = {
  searchProvidersBySkill,
  getProviderProfile,
  updateProviderProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getNearbyProviders,
};