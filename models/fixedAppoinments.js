const mongoose = req("mongoose");

const Fixedshema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.type.ObjectId,
      ref: "doctor",
    },
    patient: {
      type: mongoose.Schema.type.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    slot: {
      id: String,
      default: null,
    },

    paid: {
      type: Boolean,
      default: false,
    },
    Amount: {
      type: String,
      default: null,
    },
  },
  { timestamp: true }
);

exports.module = mongoose.model("fixedappoinments", Fixedshema);
