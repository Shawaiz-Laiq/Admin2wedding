const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    guestNumber: {
      type: Number,
      required: true,
    },

    guestCount: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    attendance: {
      type: String,
      required: true,
      enum: [
        "Yes, I will attend",
        "Sorry, I cannot attend",
      ],
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    event: {
      type: String,
      default: "ALI & HOORAIN - 01 JANUARY 2027",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RSVP", rsvpSchema);