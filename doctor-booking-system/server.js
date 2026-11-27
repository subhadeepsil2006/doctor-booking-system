require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

const authRoutes = require("./backend/routes/authRoutes");
const appointmentRoutes = require("./backend/routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
    res.send("Doctor Booking API Running");
});

// Start Server
async function startServer() {

    await connectDB();

    app.listen(process.env.PORT || 5000, () => {
        console.log("Server running on port 5000");
    });

}

startServer();