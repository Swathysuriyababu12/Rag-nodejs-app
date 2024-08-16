const mongoose = require("mongoose");

// Define the schema for your documents
const docSchema = new mongoose.Schema({
  // Define your fields here, for example:
  text: String,
  embedding:Array,
  
});

// Create a model based on the schema
const Doc = mongoose.model("Doc", docSchema);
module.exports = Doc
