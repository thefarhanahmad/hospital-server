const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      "Neurologist",
      "Dentist",
      "Ayurvedic",
      "Therapists",
      "Cardiologist",
      "Dermatologist",
      "Psychiatrist",
      "Oncologist",
      "Radiologist",
      "Orthopedic surgeon",
      "Otolaryngology",
      "Geriatrics",
      "Hematologist",
      "Pulmonologist"
    ],
   required:true
  },
});

module.exports = mongoose.model("Category", categorySchema);
