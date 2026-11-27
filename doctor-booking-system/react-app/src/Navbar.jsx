import { useState } from "react";
import Auth from "./Auth";
import { clearAuth } from "./api";
import "./Navbar.css";

function Navbar({ user, authMode: controlledAuthMode, setAuthMode: setControlledAuthMode, onLogin, onLogout, onShowAppointments }) {
    const [internalAuthMode, setInternalAuthMode] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const authMode = controlledAuthMode !== undefined ? controlledAuthMode : internalAuthMode;
    const setAuthMode = setControlledAuthMode || setInternalAuthMode;

    const handleLogin = (userData) => {
        onLogin(userData);
        setAuthMode(null);
        setMenuOpen(false);
    };

    const handleLogout = () => {
        clearAuth();
        onLogout();
        setMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <a href="#home" className="navbar-logo">
                    <span>✚</span> CarePoint
                </a>

                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="#doctors" onClick={() => setMenuOpen(false)}>Find Doctors</a>
                    <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
                    {user && (
                        <a href="#appointments" onClick={() => { setMenuOpen(false); if (onShowAppointments) onShowAppointments(); }}>My Appointments</a>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <span className="user-name">Hi, {user.name.split(" ")[0]} 👋</span>
                            <button className="login-btn" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="login-btn" onClick={() => { setAuthMode("login"); setMenuOpen(false); }}>
                                Login
                            </button>
                            <button className="signup-btn" onClick={() => { setAuthMode("signup"); setMenuOpen(false); }}>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>

                <button
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </nav>

            {authMode && (
                <Auth
                    key={authMode}
                    initialMode={authMode}
                    onClose={() => setAuthMode(null)}
                    onLogin={handleLogin}
                />
            )}
        </>
    );
}

export default Navbar;
