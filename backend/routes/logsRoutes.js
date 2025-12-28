const express = require("express");
const router = express.Router();
const Logs = require("../models/logs"); // Make sure your model path is correct

// @route   GET /api/logs
// @desc    Get all logs
router.get("/:projectId", async (req, res) => {
  try {
    const logs = await Logs.find({projectId:req.params.projectId}).sort({ date: -1 }).populate("projectId"); // latest first
    res.json(logs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/logs/:id
// @desc    Get a single log by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const log = await Logs.findById(req.params.id);
//     if (!log) return res.status(404).json({ message: "Log not found" });
//     res.json(log);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// @route   POST /api/logs
// @desc    Create a new log
router.post("/:projectId", async (req, res) => {
  try {
    const {projectId} = req.params;
    const { note, date } = req.body;
    if (!note || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newLog = new Logs({ projectId,note, date });
    const createdLog = await newLog.save();
    res.status(201).json(createdLog);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/logs/:id
// @desc    Update a log
router.put("/:id", async (req, res) => {
  try {
    const { note, date } = req.body;
    const existingLog = await Logs.findById(req.params.id);
    if (!existingLog) return res.status(404).json({ message: "Log not found" });

    existingLog.note = note || existingLog.note;
    existingLog.date = date || existingLog.date;

    const updatedLog = await existingLog.save();
    res.json(updatedLog);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/logs/:id
// @desc    Delete a log
router.delete("/:id", async (req, res) => {
  try {
    const log = await Logs.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    await log.deleteOne();
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
