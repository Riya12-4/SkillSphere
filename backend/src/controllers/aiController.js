// ===============================
// AI Skill Search Controller
// ===============================

const searchSkill = async (req, res) => {
  try {
    const { query } = req.body;

    // Check required field
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe the service you need",
      });
    }

    const text = query.toLowerCase();

    let skill = "";

    // Laptop / Computer
    if (
      text.includes("laptop") ||
      text.includes("computer") ||
      text.includes("pc") ||
      text.includes("software")
    ) {
      skill = "Laptop & Computer Repair";
    }

    // Plumbing
    else if (
      text.includes("plumb") ||
      text.includes("tap") ||
      text.includes("pipe") ||
      text.includes("leak") ||
      text.includes("water")
    ) {
      skill = "Plumber";
    }

    // Electrical
    else if (
      text.includes("electric") ||
      text.includes("wiring") ||
      text.includes("switch") ||
      text.includes("fan") ||
      text.includes("light")
    ) {
      skill = "Electrician";
    }

    // Photography
    else if (
      text.includes("photo") ||
      text.includes("photography") ||
      text.includes("camera") ||
      text.includes("photoshoot")
    ) {
      skill = "Photographer";
    }

    // Graphic Design
    else if (
      text.includes("design") ||
      text.includes("logo") ||
      text.includes("graphic") ||
      text.includes("poster")
    ) {
      skill = "Graphic Designer";
    }

    // Fitness
    else if (
      text.includes("fitness") ||
      text.includes("gym") ||
      text.includes("workout") ||
      text.includes("trainer")
    ) {
      skill = "Fitness Trainer";
    }

    // Music
    else if (
      text.includes("music") ||
      text.includes("guitar") ||
      text.includes("singing") ||
      text.includes("piano")
    ) {
      skill = "Music Teacher";
    }

    // Cooking
    else if (
      text.includes("cook") ||
      text.includes("food") ||
      text.includes("meal") ||
      text.includes("chef")
    ) {
      skill = "Home Cook";
    }

    // Default
    else {
      skill = "General Service Provider";
    }

    return res.status(200).json({
      success: true,
      message: "Skill identified successfully",
      query,
      skill,
    });
  } catch (error) {
    console.error("AI Skill Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  searchSkill,
};