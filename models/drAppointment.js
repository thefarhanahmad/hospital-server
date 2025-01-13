const mongoose = require("mongoose");

// Define the schema for appointments
const AppointmentSchema = new mongoose.Schema({
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hourlyAvailability: [
      {
        hours: {
          type: String,
          required: true,
        },
        isActive:{
            type:Boolean,
            default:true
        },
        isBooked: {
          type: Boolean,
          required: true,
        },
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
  });
  
  module.exports = mongoose.model("DoctorAppointment", AppointmentSchema);
  