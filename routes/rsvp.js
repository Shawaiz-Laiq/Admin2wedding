const express = require("express");
const router = express.Router();
const RSVP = require("../models/RSVP");

// SAVE RSVP
router.post("/", async (req, res) => {
  try {
    const {
      guestName,
      guestCount,
      attendance,
      guestMessage,
    } = req.body;

    // Validation
    if (!guestName || !guestName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name",
      });
    }

    if (!guestCount || Number(guestCount) < 1 || Number(guestCount) > 5) {
      return res.status(400).json({
        success: false,
        message: "Please select valid number of guests",
      });
    }

    if (
      !["Yes, I will attend", "Sorry, I cannot attend"].includes(attendance)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select your attendance",
      });
    }

    // Create RSVP
    const newRSVP = await RSVP.create({
      name: guestName.trim(),
      guestCount: Number(guestCount),
      attendance,
      message: guestMessage ? guestMessage.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Your RSVP has been submitted successfully!",
      rsvp: newRSVP,
    });

  } catch (error) {
    console.error("RSVP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// ADMIN: ALL RSVP RECORDS
router.get("/admin", async (req, res) => {
  try {
    const records = await RSVP.find()
      .select("name guestCount -_id")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalEntries: records.length,
      records,
    });

  } catch (error) {
    console.error("Admin RSVP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch RSVP records",
    });
  }
});


// ADMIN: DUPLICATE ENTRIES
router.get("/duplicates", async (req, res) => {
  try {
    const duplicates = await RSVP.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $trim: { input: "$name" }
            }
          },
          name: { $first: "$name" },
          totalEntries: { $sum: 1 },
          totalGuests: { $sum: "$guestCount" }
        }
      },
      {
        $match: {
          totalEntries: { $gt: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          totalEntries: 1,
          totalGuests: 1
        }
      },
      {
        $sort: { totalEntries: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      duplicateNames: duplicates.length,
      duplicates
    });

  } catch (error) {
    console.error("Duplicate RSVP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check duplicate entries"
    });
  }
});

module.exports = router;