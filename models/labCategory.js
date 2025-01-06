const mongoose = require("mongoose");

const LabCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Diabetes", "Cancer", "Kidney", "Brain"],
    required: true,
  },
});

module.exports = mongoose.model("LabCategory", LabCategorySchema);
