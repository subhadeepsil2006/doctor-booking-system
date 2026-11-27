const express = require("express");
const doctors = require("../data/doctors");

const router = express.Router();

// ─── GET /api/doctors ──────────────────────────────────────────────────────────
router.get("/", (req, res) => {
    try {
        let results = [...doctors];

        // Optional query filters: ?name=&specialty=&location=
        const { name, specialty, location } = req.query;
        if (name) {
            results = results.filter(d =>
                d.name.toLowerCase().includes(name.toLowerCase())
            );
        }
        if (specialty) {
            results = results.filter(d =>
                d.specialty.toLowerCase().includes(specialty.toLowerCase())
            );
        }
        if (location) {
            results = results.filter(d =>
                d.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error("Doctors list error:", error);
        res.status(500).json({ message: "Failed to retrieve doctors." });
    }
});

// ─── GET /api/doctors/:id ─────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const doctor = doctors.find(d => d.id === id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        res.json(doctor);
    } catch (error) {
        console.error("Doctor detail error:", error);
        res.status(500).json({ message: "Failed to retrieve doctor." });
    }
});

module.exports = router;
