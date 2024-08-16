const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // assuming sessionId is an ObjectId
  message: { type: String, required: true },
  role: { type: String, default: "USER" },
  createdAt: { type: Date, default: Date.now },
});

// Create a model based on the schema
const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
