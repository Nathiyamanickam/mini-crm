const express = require("express");
const Task = require("../models/Task");
const Lead = require("../models/Lead");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find()
    .populate("lead", "name")
    .populate("assignedTo", "name");

  res.json(tasks);
});

router.put(
  "/:id/status",
  authMiddleware,
  async (req, res) => {
    const task = await Task.findById(
      req.params.id
    );

    if (
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "Not authorized to update this task"
      });
    }

    task.status = req.body.status;
    await task.save();

    res.json(task);
  }
);

router.get(
  "/dashboard/stats",
  authMiddleware,
  async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLeads =
      await Lead.countDocuments({
        isDeleted: false
      });

    const qualifiedLeads =
      await Lead.countDocuments({
        status: "Qualified",
        isDeleted: false
      });

    const tasksDueToday =
      await Task.countDocuments({
        dueDate: {
          $gte: today
        }
      });

    const completedTasks =
      await Task.countDocuments({
        status: "Completed"
      });

    res.json({
      totalLeads,
      qualifiedLeads,
      tasksDueToday,
      completedTasks
    });
  }
);

module.exports = router;