const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const User = {
    // Create a new user
    async create(userData) {
        const db = getDB();

        const user = {
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
            createdAt: new Date()
        };

        const result = await db.collection("users").insertOne(user);

        return result;
    },

    // Find user by email
    async findByEmail(email) {
        const db = getDB();

        const normalizedEmail = email.trim().toLowerCase();

        const user = await db.collection("users").findOne({
            email: normalizedEmail
        });

        return user;
    },

    // Find user by ID
    async findById(id) {
        const db = getDB();

        if (!ObjectId.isValid(id)) {
            return null;
        }

        const user = await db.collection("users").findOne({
            _id: new ObjectId(id)
        });

        return user;
    }
};

module.exports = User;