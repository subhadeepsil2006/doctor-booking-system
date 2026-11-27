import { useState } from "react";
import "./Auth.css";
import { publicPost, saveAuth } from "./api";

function Auth({ onClose, onLogin, initialMode = "login" }) {
    const [isLogin, setIsLogin] = useState(initialMode === "login");
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const validate = () => {
        if (!form.email || !form.password) return "Email and password are required.";
        if (!isLogin && !form.name.trim()) return "Full name is required.";
        if (!isLogin && form.name.trim().length < 2) return "Name must be at least 2 characters.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return "Please enter a valid email address.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";
        if (!isLogin && !form.confirmPassword)
            return "Please confirm your password.";
        if (!isLogin && form.password !== form.confirmPassword)
            return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const payload = isLogin
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password, confirmPassword: form.confirmPassword };

            const data = await publicPost(endpoint, payload);

            saveAuth(data.token, data.user);
            setSuccess(data.message);

            setTimeout(() => {
                onLogin(data.user);
            }, 600);

        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setSuccess("");
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
    };

    return (
        <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="auth-card">
                <button className="auth-close" onClick={onClose} aria-label="Close">×</button>

                <div className="auth-logo">✚ CarePoint</div>
                <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>
                <p className="auth-subtitle">
                    {isLogin
                        ? "Login to book your appointment"
                        : "Join CarePoint and book your doctor"}
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPass ? "text" : "password"}
                                name="password"
                                placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
                                value={form.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                            />
                            <button
                                type="button"
                                className="show-pass"
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility"
                            >
                                {showPass ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPass ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="show-pass"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPass ? "🙈" : "👁"}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <div className="auth-error">⚠ {error}</div>}
                    {success && <div className="auth-success">✓ {success}</div>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? (isLogin ? "Logging in..." : "Creating account...")
                            : (isLogin ? "Login" : "Create Account")}
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={switchMode} className="auth-switch-btn" disabled={loading}>
                        {isLogin ? " Sign Up" : " Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;
