const Portfolio = require("../models/Portfolio");

// ===============================
// Add Portfolio Item
// ===============================
const addPortfolioItem = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can add portfolio items",
      });
    }

    const { title, description, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Portfolio title is required",
      });
    }

    const portfolioItem = await Portfolio.create({
      provider: req.user._id,
      title: title.trim(),
      description: description || "",
      imageUrl: imageUrl || "",
    });

    return res.status(201).json({
      success: true,
      message: "Portfolio item added successfully",
      portfolioItem,
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
// Get My Portfolio
// ===============================
const getMyPortfolio = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can access this portfolio",
      });
    }

    const portfolio = await Portfolio.find({
      provider: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("Get Portfolio Error:", error);

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
        message: "Only providers can delete portfolio items",
      });
    }

    const { portfolioId } = req.params;

    const portfolioItem = await Portfolio.findOne({
      _id: portfolioId,
      provider: req.user._id,
    });

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found",
      });
    }

    await portfolioItem.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Portfolio item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Portfolio Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ===============================
// Get Provider Portfolio
// ===============================
const getProviderPortfolio = async (req, res) => {
  try {
    const { providerId } = req.params;

    const portfolio = await Portfolio.find({
      provider: providerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(
      "Get Provider Portfolio Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  addPortfolioItem,
  getMyPortfolio,
  getProviderPortfolio,
  deletePortfolioItem,
};