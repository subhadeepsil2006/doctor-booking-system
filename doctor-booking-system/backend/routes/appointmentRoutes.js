const express = require("express");

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");
const doctors = require("../data/doctors");

const router = express.Router();

// All appointment routes require auth
router.use(authMiddleware);

// ─── POST /api/appointments ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { doctorId, patientName, email, phone, date, time } = req.body;

        // Validate required fields
        if (!doctorId || !patientName || !email || !phone || !date || !time) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        // Validate phone
        if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
            return res.status(400).json({ message: "Please enter a valid 10-digit phone number." });
        }

        // Validate date format (YYYY-MM-DD) and ensure it is not in the past
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date + "T00:00:00").getTime())) {
            return res.status(400).json({ message: "Please enter a valid appointment date (YYYY-MM-DD)." });
        }

        const todayStr = new Date().toISOString().split("T")[0];
        if (date < todayStr) {
            return res.status(400).json({ message: "Appointment date cannot be in the past." });
        }

        // Validate doctor exists and slot is valid
        const parsedDoctorId = parseInt(doctorId, 10);
        const doctor = doctors.find(d => d.id === parsedDoctorId);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        if (!doctor.slots.includes(time)) {
            return res.status(400).json({ message: "Selected time slot is not available for this doctor." });
        }

        // Create appointment (duplicate check is inside model)
        const result = await Appointment.create({
            userId: req.user.userId,
            doctorId: parsedDoctorId,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            patientName: patientName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            date,
            time
        });

        res.status(201).json({
            message: "Appointment booked successfully!",
            appointment: {
                id: result.insertedId.toString(),
                doctorName: doctor.name,
                doctorSpecialty: doctor.specialty,
                date,
                time
            }
        });

    } catch (error) {
        if (error.message === "SLOT_TAKEN") {
            return res.status(409).json({
                message: "This time slot is already booked. Please choose another slot."
            });
        }
        console.error("Appointment create error:", error);
        res.status(500).json({ message: "Appointment booking failed. Please try again." });
    }
});


// ─── GET /api/appointments ─────────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.findByUser(req.user.userId);
        res.json(appointments);
    } catch (error) {
        console.error("Appointments fetch error:", error);
        res.status(500).json({ message: "Unable to fetch appointments." });
    }
});


// ─── GET /api/appointments/:id ────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        // Ensure user can only view their own appointments
        if (appointment.userId !== req.user.userId) {
            return res.status(403).json({ message: "Access denied." });
        }

        res.json(appointment);
    } catch (error) {
        console.error("Appointment fetch error:", error);
        res.status(500).json({ message: "Unable to fetch appointment." });
    }
});


// ─── DELETE /api/appointments/:id ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Appointment.deleteById(req.params.id, req.user.userId);

        if (!deleted) {
            return res.status(404).json({
                message: "Appointment not found or you are not authorized to cancel it."
            });
        }

        res.json({ message: "Appointment cancelled successfully." });
    } catch (error) {
        console.error("Appointment delete error:", error);
        res.status(500).json({ message: "Failed to cancel appointment." });
    }
});

module.exports = router;
