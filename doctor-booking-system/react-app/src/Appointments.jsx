import { useState, useEffect } from "react";
import { authGet, authDelete } from "./api";
import "./Appointments.css";

function Appointments({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await authGet("/appointments");
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        setCancelling(id);
        setError("");
        try {
            await authDelete(`/appointments/${id}`);
            setAppointments(prev => prev.filter(a => (a._id || a.id || "").toString() !== id));
        } catch (err) {
            setError(err.message || "Failed to cancel appointment.");
        } finally {
            setCancelling(null);
        }
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <section className="appointments-section" id="appointments">
                <div className="appt-loading">
                    <div className="spinner" />
                    <p>Loading your appointments...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="appointments-section" id="appointments">
            <div className="appt-header">
                <span className="section-label">MY BOOKINGS</span>
                <h2>Your Appointments</h2>
                <p>Manage and track all your upcoming consultations.</p>
            </div>

            {error && (
                <div className="appt-error">
                    ⚠ {error}
                    <button onClick={fetchAppointments} className="retry-btn">Retry</button>
                </div>
            )}

            {!error && appointments.length === 0 ? (
                <div className="appt-empty">
                    <div className="empty-icon">📅</div>
                    <h3>No appointments yet</h3>
                    <p>Browse our doctors below and book your first consultation!</p>
                    <a href="#doctors" className="find-btn">Find a Doctor →</a>
                </div>
            ) : (
                <div className="appt-grid">
                    {appointments.map((appt) => {
                        const id = (appt._id || appt.id || "").toString();
                        const initials = appt.doctorName
                            ? appt.doctorName.split(" ").slice(1).map(w => w[0]).join("").slice(0, 2).toUpperCase()
                            : "DR";

                        return (
                            <div key={id} className="appt-card">
                                <div className="appt-card-header">
                                    <div className="appt-avatar">{initials}</div>
                                    <div className="appt-doc-info">
                                        <h3>{appt.doctorName}</h3>
                                        <span className="appt-specialty">{appt.doctorSpecialty}</span>
                                    </div>
                                    <span className={`appt-status ${appt.status}`}>
                                        {appt.status || "confirmed"}
                                    </span>
                                </div>

                                <div className="appt-details">
                                    <div className="appt-detail-row">
                                        <span>📅 Date</span>
                                        <strong>{formatDate(appt.date)}</strong>
                                    </div>
                                    <div className="appt-detail-row">
                                        <span>🕐 Time</span>
                                        <strong>{appt.time}</strong>
                                    </div>
                                    <div className="appt-detail-row">
                                        <span>👤 Patient</span>
                                        <strong>{appt.patientName}</strong>
                                    </div>
                                    <div className="appt-detail-row">
                                        <span>📞 Phone</span>
                                        <strong>{appt.phone}</strong>
                                    </div>
                                </div>

                                <button
                                    className="cancel-btn"
                                    onClick={() => handleCancel(id)}
                                    disabled={cancelling === id}
                                >
                                    {cancelling === id ? "Cancelling..." : "Cancel Appointment"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Appointments;
