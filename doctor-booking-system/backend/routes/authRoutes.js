const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        if (confirmPassword && confirmPassword !== password) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ message: "This email is already registered. Please login." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const userId = result.insertedId.toString();

        const token = jwt.sign(
            { userId, email: normalizedEmail },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            message: "Registration successful! Welcome to CarePoint.",
            token,
            user: {
                id: userId,
                name: name.trim(),
                email: normalizedEmail
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
});


// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findByEmail(normalizedEmail);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.json({
            message: "Login successful! Welcome back.",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
});


// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Me Error:", error);
        res.status(500).json({ message: "Failed to get user info." });
    }
});

module.exports = router;
