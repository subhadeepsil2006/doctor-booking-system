import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BookingModal from "./BookingModal";
import Appointments from "./Appointments";
import { getStoredUser, getAuthToken, authGet, clearAuth, publicGet } from "./api";
import "./style.css";

function App() {
    // ── Auth state ──────────────────────────────────────────────────────────
    const [user, setUser] = useState(() => getStoredUser());
    const [authMode, setAuthMode] = useState(null);

    // ── Doctor listing ──────────────────────────────────────────────────────
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [doctorsError, setDoctorsError] = useState("");

    // ── Search ──────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");

    // ── Booking modal ───────────────────────────────────────────────────────
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // ── Show appointments section ───────────────────────────────────────────
    const [showAppointments, setShowAppointments] = useState(false);
    const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);

    // Verify stored session & fetch doctors from backend on mount
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            authGet("/auth/me")
                .then((data) => {
                    if (data && data.user) {
                        setUser(data.user);
                    }
                })
                .catch(() => {
                    clearAuth();
                    setUser(null);
                });
        }
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setDoctorsLoading(true);
        setDoctorsError("");
        try {
            const data = await publicGet("/doctors");
            setDoctors(Array.isArray(data) ? data : []);
        } catch (err) {
            setDoctorsError(err.message || "Could not load doctors. Please ensure the backend is running.");
        } finally {
            setDoctorsLoading(false);
        }
    };

    // Filter doctors by search text
    const filteredDoctors = (Array.isArray(doctors) ? doctors : []).filter((doc) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        return (
            (doc.name || "").toLowerCase().includes(q) ||
            (doc.specialty || "").toLowerCase().includes(q) ||
            (doc.location || "").toLowerCase().includes(q)
        );
    });

    const handleLogin = (userData) => {
        setUser(userData);
        setAuthMode(null);
    };

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        setShowAppointments(false);
    };

    const handleBooking = (doctor) => {
        if (!user || !getAuthToken()) {
            setAuthMode("login");
            return;
        }
        setSelectedDoctor(doctor);
    };

    // Helper: derive initials from doctor name
    const getInitials = (name) => {
        if (!name || typeof name !== "string") return "DR";
        const parts = name.trim().split(/\s+/);
        const target = parts.length > 1 ? parts.slice(1) : parts;
        return target.map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "DR";
    };

    return (
        <div className="app">

            {/* ── NAVBAR ──────────────────────────────────────────────────── */}
            <Navbar
                user={user}
                authMode={authMode}
                setAuthMode={setAuthMode}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onShowAppointments={() => setShowAppointments(true)}
            />

            {/* ── HERO ────────────────────────────────────────────────────── */}
            <section className="hero-section" id="home">
                <div className="hero-content">
                    <span className="section-label">YOUR HEALTH, OUR PRIORITY</span>
                    <h1>
                        Good health starts
                        <br />
                        with the <span>right doctor.</span>
                    </h1>
                    <p>
                        Find trusted doctors, check available time slots
                        and book your appointment in just a few clicks.
                    </p>
                    <div className="hero-cta">
                        <a href="#doctors" className="hero-button">Find a Doctor →</a>
                        {user && (
                            <a
                                href="#appointments"
                                className="hero-button-outline"
                                onClick={() => setShowAppointments(true)}
                            >
                                My Appointments
                            </a>
                        )}
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="medical-circle"><span>✚</span></div>
                    <div className="hero-floating-card">
                        <p>Trusted by</p>
                        <strong>10,000+ patients</strong>
                    </div>
                    <div className="hero-floating-card-2">
                        <p>Care that</p>
                        <strong>comes first.</strong>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ───────────────────────────────────────────────── */}
            <div className="stats-bar">
                <div className="stat-item"><strong>50+</strong><span>Specialist Doctors</span></div>
                <div className="stat-divider" />
                <div className="stat-item"><strong>10K+</strong><span>Happy Patients</span></div>
                <div className="stat-divider" />
                <div className="stat-item"><strong>5★</strong><span>Avg. Rating</span></div>
                <div className="stat-divider" />
                <div className="stat-item"><strong>100%</strong><span>Secure Booking</span></div>
            </div>

            {/* ── DOCTORS SECTION ─────────────────────────────────────────── */}
            <section className="doctors-section" id="doctors">

                <div className="doctors-heading">
                    <div>
                        <span className="section-label">OUR SPECIALISTS</span>
                        <h2>Find your doctor</h2>
                    </div>
                    <span className="doctor-count">
                        {doctorsLoading ? "Loading..." : `${filteredDoctors.length} doctors available`}
                    </span>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <span className="search-icon-left">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by doctor name, specialty or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch("")}>×</button>
                    )}
                </div>

                {/* Error State */}
                {doctorsError && (
                    <div className="doctors-error">
                        ⚠ {doctorsError}
                        <button onClick={fetchDoctors} className="retry-doctors-btn">Retry</button>
                    </div>
                )}

                {/* Loading State */}
                {doctorsLoading && (
                    <div className="doctors-loading">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="doctor-skeleton" />
                        ))}
                    </div>
                )}

                {/* Doctor Cards */}
                {!doctorsLoading && (
                    <div className="doctor-grid">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <div className="doctor-card" key={doctor.id}>
                                    <div className="doctor-avatar">{getInitials(doctor.name)}</div>

                                    <div className="doctor-details">
                                        <span className="specialty-badge">{doctor.specialty}</span>
                                        <h3>{doctor.name}</h3>
                                        <p className="doctor-experience">
                                            {doctor.experience} · {doctor.location}
                                        </p>

                                        <div className="doctor-info-row">
                                            <span className="rating">★ {doctor.rating}</span>
                                            <span className="fee">₹{doctor.fee}</span>
                                        </div>

                                        <p className="doctor-about">{doctor.about}</p>

                                        <div className="slot-preview">
                                            {(doctor.slots || []).slice(0, 3).map(slot => (
                                                <span key={slot} className="slot-tag">{slot}</span>
                                            ))}
                                            {(doctor.slots || []).length > 3 && (
                                                <span className="slot-more">+{(doctor.slots || []).length - 3} more</span>
                                            )}
                                        </div>

                                        <button
                                            className="book-button"
                                            onClick={() => handleBooking(doctor)}
                                        >
                                            Book Appointment →
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-doctors">
                                <h3>No doctors found</h3>
                                <p>Try searching with a different name, specialty, or city.</p>
                            </div>
                        )}
                    </div>
                )}

            </section>

            {/* ── MY APPOINTMENTS ────────────────────────────────────────── */}
            {user && showAppointments && (
                <Appointments key={appointmentsRefreshKey} user={user} />
            )}

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section className="how-section" id="how">
                <div className="how-heading">
                    <span className="section-label">SIMPLE PROCESS</span>
                    <h2>How CarePoint works</h2>
                    <p>Booking your healthcare appointment has never been easier.</p>
                </div>

                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-icon">🔍</div>
                        <h3>Find a Doctor</h3>
                        <p>Search for trusted doctors based on their specialty and location.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-icon">📅</div>
                        <h3>Choose a Slot</h3>
                        <p>Check available appointment slots and select a convenient time.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-icon">✅</div>
                        <h3>Book Appointment</h3>
                        <p>Confirm your booking instantly and get ready for your consultation.</p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer className="footer">
                <h2>✚ CarePoint</h2>
                <p>Your health, our priority.</p>
                <p className="footer-copy">© 2026 CarePoint. All rights reserved.</p>
            </footer>

            {/* ── BOOKING MODAL ─────────────────────────────────────────────── */}
            {selectedDoctor && (
                <BookingModal
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    onBooked={() => {
                        setShowAppointments(true);
                        setAppointmentsRefreshKey(k => k + 1);
                        setTimeout(() => {
                            const el = document.getElementById("appointments");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                    }}
                />
            )}

        </div>
    );
}

export default App;
