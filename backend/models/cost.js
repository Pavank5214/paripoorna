const mongoose = require("mongoose");

const costSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // e.g., Materials, Labour, Machines
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    date: { type: Date, default: Date.now },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cost", costSchema);
