const { getDB } = require("../config/db");

const Appointment = {

    async create(data) {
        const db = getDB();

        return await db.collection("appointments").insertOne({
            ...data,
            createdAt: new Date()
        });
    },

    async findByUser(userId) {
        const db = getDB();

        return await db.collection("appointments")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
    }

};

module.exports = Appointment;