import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");

      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>

      <div className="login-container">

        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon">S</div>

          <h1>SkillSphere</h1>

          <p>
            Discover trusted skills around you.
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">

          <div className="card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to SkillSphere</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Role Selection */}
            <div className="form-group">
              <label>Continue as</label>

              <div className="role-selection">

                {/* Customer */}
                <button
                  type="button"
                  className={`role-button ${
                    formData.role === "customer"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "customer",
                    })
                  }
                >
                  <span className="role-icon">👤</span>

                  <span>
                    <strong>Customer</strong>
                    <small>Find local services</small>
                  </span>
                </button>

                {/* Provider */}
                <button
                  type="button"
                  className={`role-button ${
                    formData.role === "provider"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "provider",
                    })
                  }
                >
                  <span className="role-icon">🛠️</span>

                  <span>
                    <strong>Provider</strong>
                    <small>Offer your services</small>
                  </span>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  className={`role-button ${
                    formData.role === "admin"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "admin",
                    })
                  }
                >
                  <span className="role-icon">🛡️</span>

                  <span>
                    <strong>Admin</strong>
                    <small>Manage SkillSphere</small>
                  </span>
                </button>

              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-button"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Message */}
          {message && (
            <div
              className={
                message.includes("successful")
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </div>
          )}

          {/* Register */}
          <div className="register-section">
            <span>Don't have an account?</span>

            <button type="button">
              Create account
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="footer-text">
          © 2026 SkillSphere · Local skills, trusted connections.
        </p>

      </div>
    </div>
  );
}

export default Login;