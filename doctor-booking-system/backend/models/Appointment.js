const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const Appointment = {

    async create(data) {
        const db = getDB();

        // Check for duplicate booking of same doctor+date+time
        const existing = await db.collection("appointments").findOne({
            doctorId: data.doctorId,
            date: data.date,
            time: data.time
        });

        if (existing) {
            throw new Error("SLOT_TAKEN");
        }

        return await db.collection("appointments").insertOne({
            ...data,
            status: "confirmed",
            createdAt: new Date()
        });
    },

    async findByUser(userId) {
        const db = getDB();
        return await db.collection("appointments")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
    },

    async findById(id) {
        const db = getDB();
        try {
            return await db.collection("appointments").findOne({ _id: new ObjectId(id) });
        } catch {
            return null;
        }
    },

    async deleteById(id, userId) {
        const db = getDB();
        try {
            const result = await db.collection("appointments").deleteOne({
                _id: new ObjectId(id),
                userId: userId
            });
            return result.deletedCount;
        } catch {
            return 0;
        }
    }

};

module.exports = Appointment;
