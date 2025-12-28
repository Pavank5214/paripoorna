// models/material.js
const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  materialName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "Low Stock", "Out of Stock"],
    default: "Available",
  },
});

module.exports = mongoose.model("Material", MaterialSchema);
