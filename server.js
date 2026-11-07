const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const rsvpRoutes = require("./routes/rsvp");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/rsvp", rsvpRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("RSVP Backend is running!");
});

// Server
const PORT = process.env.PORT || 5001;
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});