const express = require("express");
const Lead = require("../models/Lead");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const lead = await Lead.create(req.body);
  res.status(201).json(lead);
});

router.get("/", authMiddleware, async (req, res) => {
  const {
    search = "",
    status = "",
    page = 1
  } = req.query;

  const limit = 5;

  const query = {
    isDeleted: false,
    name: {
      $regex: search,
      $options: "i"
    }
  };

  if (status) {
    query.status = status;
  }

  const leads = await Lead.find(query)
    .populate("assignedTo", "name")
    .populate("company", "name")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Lead.countDocuments(query);

  res.json({
    leads,
    totalPages: Math.ceil(total / limit)
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(lead);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Lead.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  res.json({
    message: "Lead soft deleted"
  });
});

module.exports = router;