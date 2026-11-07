
const express = require("express");
const router = express.Router();
const RSVP = require("../models/RSVP");

// =================================
// SAVE RSVP
// =================================

router.post("/", async (req, res) => {
  try {
    const {
      guestName,
      guestNumber,
      guestCount,
      attendance,
      guestMessage,
    } = req.body;

    // Name validation
    if (!guestName || !guestName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name",
      });
    }

    if (guestName.trim().length > 15) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 15 characters",
      });
    }

    // Phone validation
    const cleanNumber = String(guestNumber || "").trim();

    if (!/^03[0-9]{9}$/.test(cleanNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 11-digit mobile number (03XXXXXXXXX)",
      });
    }

    // Guest count validation
    const count = Number(guestCount);

    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        message: "Please select valid number of guests",
      });
    }

    // Attendance validation
    if (
      !["Yes, I will attend", "Sorry, I cannot attend"].includes(attendance)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select your attendance",
      });
    }

    // Message validation
    if (guestMessage && guestMessage.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 100 characters",
      });
    }

    // Save RSVP
    const newRSVP = await RSVP.create({
      name: guestName.trim(),
      guestNumber: cleanNumber,
      guestCount: count,
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


// =================================
// ADMIN: ALL RSVP RECORDS
// =================================

router.get("/admin", async (req, res) => {
  try {
    const records = await RSVP.find()
      .select("name guestNumber guestCount attendance message createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      totalEntries: records.length,
      totalGuests: records.reduce(
        (total, record) => total + record.guestCount,
        0
      ),
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


// =================================
// ADMIN: DUPLICATE PHONE NUMBERS
// =================================

router.get("/duplicates", async (req, res) => {
  try {
    const duplicates = await RSVP.aggregate([
      {
        $match: {
          guestNumber: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$guestNumber",
          totalEntries: { $sum: 1 },
          totalGuests: { $sum: "$guestCount" },
          names: { $addToSet: "$name" },
          records: {
            $push: {
              name: "$name",
              guestNumber: "$guestNumber",
              guestCount: "$guestCount",
              attendance: "$attendance",
              message: "$message",
              createdAt: "$createdAt"
            }
          }
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
          guestNumber: "$_id",
          totalEntries: 1,
          totalGuests: 1,
          names: 1,
          records: 1
        }
      },
      {
        $sort: {
          totalEntries: -1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      duplicateNumbers: duplicates.length,
      duplicates
    });

  } catch (error) {
    console.error("Duplicate RSVP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check duplicate numbers"
    });
  }
});

module.exports = router;
