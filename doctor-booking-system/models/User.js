const { getDB } = require("../config/db");

const User = {

    async create(userData) {
        const db = getDB();

        return await db.collection("users").insertOne({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            createdAt: new Date()
        });
    },

    async findByEmail(email) {
        const db = getDB();

        return await db.collection("users").findOne({
            email: email.toLowerCase()
        });
    }

};

module.exports = User;