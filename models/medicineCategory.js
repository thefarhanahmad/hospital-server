const mongoose = require("mongoose");

const MedicineCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      "Baby & Mother",
      "OTC Medicines",
      "Diabetes",
      "Wellness",
      "Personal Care",
    ],
    required: true,
  },
});

module.exports = mongoose.model("MedicineCategory", MedicineCategorySchema);
