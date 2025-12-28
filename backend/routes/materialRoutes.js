const express = require("express");
const Material = require("../models/material");
const router = express.Router();

// ✅ Create a new material for a project
router.post("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { materialName, quantity, status } = req.body;

    if (!materialName || !quantity) {
      return res.status(400).json({ message: "Material name and quantity are required" });
    }

    const material = new Material({ projectId, materialName, quantity, status });
    const createdMaterial = await material.save();

    res.status(201).json(createdMaterial); 
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all materials (no 404, always returns array)
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find().populate("projectId");
    res.json(Array.isArray(materials) ? materials : []); // always return array
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all materials for a specific project
router.get("/:projectId", async (req, res) => {
  try {
    const materials = await Material.find({ projectId: req.params.projectId })
      .populate("projectId");
    res.json(Array.isArray(materials) ? materials : []); // always return array
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update material
router.put("/item/:id", async (req, res) => {
  try {
    const { materialName, quantity, status } = req.body;
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    material.materialName = materialName || material.materialName;
    material.quantity = quantity || material.quantity;
    material.status = status || material.status;

    const updated = await material.save();

    res.json(updated); 
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete material
router.delete("/item/:id", async (req, res) => {
  try {
    const deleted = await Material.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Material not found" });

    res.json({ message: "Material deleted successfully" }); 
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
