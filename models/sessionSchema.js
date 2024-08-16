const mongoose = require("mongoose");

// Define the schema for your documents
const sesSchema = new mongoose.Schema({
  // Define your fields here, for example:
  createdAt: { type: Date, default: Date.now },
});

// Create a model based on the schema
const Session = mongoose.model("session", sesSchema);
module.exports = Session;
