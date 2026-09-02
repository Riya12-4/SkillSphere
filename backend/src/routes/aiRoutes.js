const express = require("express");
const router = express.Router();

const { searchSkill } = require("../controllers/aiController");

// AI Skill Search
router.post("/skill-search", searchSkill);

module.exports = router;