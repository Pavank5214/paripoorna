const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  progress: { type: Number, default: 0 },
  deadline: String,
  manager: String,
  plannedBudget: String,
  description: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'delayed', 'planning'],
    default: 'planning'
  }
}, { timestamps: true });

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);
