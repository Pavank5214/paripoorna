const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  issue: { type: String, required: true },
  status: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }

});

module.exports = mongoose.model("Issue", issueSchema);
