const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, if you track users
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // auto-delete after 1 day (86400 seconds)
});

module.exports = mongoose.model("Chat", chatSchema);
