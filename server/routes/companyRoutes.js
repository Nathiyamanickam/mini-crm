const express = require("express");
const Company = require("../models/Company");
const Lead = require("../models/Lead");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json(company);
});

router.get("/", authMiddleware, async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

router.get("/:id", authMiddleware, async (req, res) => {
  const company = await Company.findById(
    req.params.id
  );

  const leads = await Lead.find({
    company: req.params.id,
    isDeleted: false
  });

  res.json({
    company,
    leads
  });
});

module.exports = router;