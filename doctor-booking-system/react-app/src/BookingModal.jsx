import { useState } from "react";
import { authPost } from "./api";
import "./BookingModal.css";

function BookingModal({ doctor, onClose, onBooked }) {
    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        patientName: "",
        email: "",
        phone: "",
        date: today,
        time: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.patientName.trim()) return setError("Patient name is required.");
        if (!form.email.trim()) return setError("Email is required.");
        if (!form.phone.trim()) return setError("Phone number is required.");
        if (!form.date) return setError("Please select a date.");
        if (!form.time) return setError("Please select a time slot.");

        setLoading(true);
        try {
            const data = await authPost("/appointments", {
                doctorId: doctor.id,
                patientName: form.patientName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                date: form.date,
                time: form.time
            });

            setSuccess(
                `Appointment confirmed with ${doctor.name} on ${form.date} at ${form.time}.`
            );
            if (onBooked) onBooked(data.appointment);

        } catch (err) {
            setError(err.message || "Booking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const initials = doctor.name
        .split(" ")
        .slice(1)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
            <div className="modal-card">
                <button className="modal-close" onClick={onClose} disabled={loading}>×</button>

                {/* Doctor Info Header */}
                <div className="modal-doctor-info">
                    <div className="modal-avatar">{initials}</div>
                    <div>
                        <h2>{doctor.name}</h2>
                        <span className="modal-specialty">{doctor.specialty}</span>
                        <p className="modal-meta">
                            📍 {doctor.location} &nbsp;·&nbsp; 💰 ₹{doctor.fee} consultation
                        </p>
                    </div>
                </div>

                {success ? (
                    <div className="booking-success">
                        <div className="success-icon">✓</div>
                        <h3>Appointment Booked!</h3>
                        <p>{success}</p>
                        <button className="close-success-btn" onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="modal-form-grid">
                            <div className="form-group">
                                <label>Patient Name *</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    placeholder="Full name of patient"
                                    value={form.patientName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="10-digit mobile number"
                                    value={form.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Appointment Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    min={today}
                                    value={form.date}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Time Slot *</label>
                            <div className="slot-grid">
                                {doctor.slots.map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`slot-btn ${form.time === slot ? "selected" : ""}`}
                                        onClick={() => { setForm({ ...form, time: slot }); setError(""); }}
                                        disabled={loading}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="modal-error">⚠ {error}</div>}

                        <button type="submit" className="modal-submit" disabled={loading}>
                            {loading ? "Booking..." : "Confirm Appointment →"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default BookingModal;
