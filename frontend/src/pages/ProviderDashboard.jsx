import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProviderDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] =
    useState(true);

  const [updatingBooking, setUpdatingBooking] =
    useState(null);

  const [message, setMessage] = useState("");

  // Provider Profile
  const [profileComplete, setProfileComplete] =
    useState(false);

  // ===============================
  // Load User
  // ===============================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ===============================
  // Check Provider Profile Completion
  // ===============================
  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/providers/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const provider = response.data.provider;

        const isComplete =
          provider.skills &&
          provider.skills.length > 0 &&
          provider.bio &&
          provider.bio.trim() !== "" &&
          provider.experience !== undefined &&
          Number(provider.experience) >= 0 &&
          provider.price !== undefined &&
          Number(provider.price) > 0 &&
          provider.location &&
          provider.location.trim() !== "" &&
          provider.serviceRadius !== undefined &&
          Number(provider.serviceRadius) > 0;

        setProfileComplete(Boolean(isComplete));
      }
    } catch (error) {
      console.error(
        "Fetch Provider Profile Error:",
        error
      );

      setProfileComplete(false);
    }
  };

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  // ===============================
  // Get Provider Bookings
  // ===============================
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login again.");
        setLoadingBookings(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/bookings/provider-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error(
        "Fetch Provider Bookings Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to load booking requests."
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ===============================
  // Update Booking Status
  // ===============================
  const updateBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      const token = localStorage.getItem("token");

      setUpdatingBooking(bookingId);
      setMessage("");

      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(
          `Booking ${status} successfully.`
        );

        await fetchBookings();
      }
    } catch (error) {
      console.error(
        "Update Booking Status Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingBooking(null);
    }
  };

  // ===============================
  // Logout
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ===============================
  // Statistics
  // ===============================
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const totalEarnings = bookings
    .filter(
      (booking) =>
        booking.paymentStatus === "paid"
    )
    .reduce(
      (total, booking) =>
        total + (Number(booking.price) || 0),
      0
    );

  const paidBookings = bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid"
  ).length;

  const pendingPayments = bookings.filter(
    (booking) =>
      booking.status === "accepted" &&
      booking.paymentStatus !== "paid"
  ).length;

  // ===============================
  // Format Date
  // ===============================
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="dashboard-page">

      {/* ===============================
          Navbar
      =============================== */}

      <nav className="dashboard-navbar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">S</div>

          <span>SkillSphere</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      <main className="dashboard-content">

        {/* ===============================
            Welcome
        =============================== */}

        <section className="welcome-section">
          <p className="dashboard-label">
            PROVIDER DASHBOARD
          </p>

          <h1>
            Welcome back
            {user?.fullName
              ? `, ${user.fullName}`
              : ""}
            ! 👋
          </h1>

          <p>
            Manage your services, bookings,
            customers and earnings.
          </p>
        </section>

        {/* ===============================
            Stats
        =============================== */}

        <section className="provider-stats">

          <div className="stat-card">
            <span>💰</span>

            <p>Total Earnings</p>

            <h2>₹{totalEarnings}</h2>
          </div>

          <div className="stat-card">
            <span>📅</span>

            <p>Pending Requests</p>

            <h2>{pendingBookings}</h2>
          </div>

          <div className="stat-card">
            <span>💳</span>

            <p>Paid Bookings</p>

            <h2>{paidBookings}</h2>
          </div>

          <div className="stat-card">
            <span>⏳</span>

            <p>Pending Payments</p>

            <h2>{pendingPayments}</h2>
          </div>

        </section>

        {/* ===============================
            Booking Requests
        =============================== */}

        <section className="provider-bookings-section">

          <div className="section-heading">

            <div>
              <span className="ai-badge">
                BOOKING REQUESTS
              </span>

              <h2>
                Incoming Service Requests
              </h2>

              <p>
                Review customer requests and manage
                your bookings.
              </p>
            </div>

            <span className="booking-count">
              {bookings.length}{" "}
              {bookings.length === 1
                ? "Booking"
                : "Bookings"}
            </span>

          </div>

          {message && (
            <div className="booking-message">
              {message}
            </div>
          )}

          {loadingBookings ? (
            <div className="booking-empty">
              <p>
                Loading booking requests...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="booking-empty">

              <div className="empty-icon">
                📭
              </div>

              <h3>
                No booking requests
              </h3>

              <p>
                New customer booking requests will
                appear here.
              </p>

            </div>
          ) : (
            <div className="provider-bookings-list">

              {bookings.map((booking) => (
                <div
                  className="provider-booking-card"
                  key={booking._id}
                >

                  {/* Customer */}

                  <div className="booking-customer">

                    <div className="customer-avatar">
                      {booking.customer?.fullName
                        ? booking.customer.fullName
                            .charAt(0)
                            .toUpperCase()
                        : "C"}
                    </div>

                    <div>
                      <h3>
                        {booking.customer?.fullName ||
                          "Customer"}
                      </h3>

                      <p>
                        {booking.customer?.email ||
                          "No email"}
                      </p>

                      {booking.customer?.phone && (
                        <small>
                          📞{" "}
                          {booking.customer.phone}
                        </small>
                      )}
                    </div>

                  </div>

                  {/* Service Details */}

                  <div className="booking-details">

                    <div>
                      <span>🛠️ Service</span>

                      <strong>
                        {booking.service}
                      </strong>
                    </div>

                    <div>
                      <span>📅 Date</span>

                      <strong>
                        {formatDate(
                          booking.bookingDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>💰 Price</span>

                      <strong>
                        ₹{booking.price}
                      </strong>
                    </div>

                  </div>

                  {/* Description */}

                  {booking.description && (
                    <div className="booking-description">

                      <span>
                        Customer Requirement
                      </span>

                      <p>
                        {booking.description}
                      </p>

                    </div>
                  )}

                  {/* Status */}

                  <div className="booking-footer">

                    <span
                      className={`booking-status ${booking.status}`}
                    >
                      {booking.status
                        .charAt(0)
                        .toUpperCase() +
                        booking.status.slice(1)}
                    </span>

                    {booking.paymentStatus ===
                    "paid" ? (
                      <span className="payment-status paid">
                        💳 Paid
                      </span>
                    ) : booking.status ===
                      "accepted" ? (
                      <span className="payment-status pending">
                        ⏳ Payment Pending
                      </span>
                    ) : null}

                    {/* Pending Actions */}

                    {booking.status ===
                      "pending" && (
                      <div className="booking-actions">

                        <button
                          className="reject-button"
                          disabled={
                            updatingBooking ===
                            booking._id
                          }
                          onClick={() =>
                            updateBookingStatus(
                              booking._id,
                              "rejected"
                            )
                          }
                        >
                          {updatingBooking ===
                          booking._id
                            ? "Updating..."
                            : "Reject"}
                        </button>

                        <button
                          className="accept-button"
                          disabled={
                            updatingBooking ===
                            booking._id
                          }
                          onClick={() =>
                            updateBookingStatus(
                              booking._id,
                              "accepted"
                            )
                          }
                        >
                          {updatingBooking ===
                          booking._id
                            ? "Updating..."
                            : "Accept"}
                        </button>

                      </div>
                    )}

                    {/* Accepted Action */}

                    {booking.status ===
                      "accepted" && (
                      <button
                        className="accept-button"
                        disabled={
                          updatingBooking ===
                          booking._id
                        }
                        onClick={() =>
                          updateBookingStatus(
                            booking._id,
                            "completed"
                          )
                        }
                      >
                        {updatingBooking ===
                        booking._id
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* ===============================
            Provider Features
        =============================== */}

        <section className="dashboard-grid">

          <div className="dashboard-card">

            <div className="card-icon">
              👤
            </div>

            <h3>
              My Profile
            </h3>

            <p>
              Create and manage your professional
              profile, skills and experience.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/provider-profile-edit"
                )
              }
            >
              {profileComplete
                ? "Edit Profile"
                : "Complete Profile"}
            </button>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              📋
            </div>

            <h3>
              Booking Requests
            </h3>

            <p>
              View incoming service requests and
              accept or reject bookings.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/provider-bookings"
                )
              }
            >
              View Requests
            </button>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              💬
            </div>

            <h3>
              Messages
            </h3>

            <p>
              Communicate with customers before and
              after bookings.
            </p>

            <button
              onClick={() =>
                navigate("/chat")
              }
            >
              Open Chat
            </button>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">
              📸
            </div>

            <h3>
              Portfolio
            </h3>

            <p>
              Showcase your previous work,
              certifications and professional
              experience.
            </p>

            <button
              onClick={() =>
                navigate("/provider-profile-edit")
              }
            >
              Manage Portfolio
            </button>

          </div>

        </section>

        {/* ===============================
            Profile Completion
        =============================== */}

        <section className="provider-profile-card">

          <div>

            <span className="ai-badge">
              {profileComplete
                ? "PROFILE COMPLETE"
                : "GET STARTED"}
            </span>

            <h2>
              {profileComplete
                ? "Your professional profile is complete"
                : "Complete your professional profile"}
            </h2>

            <p>
              {profileComplete
                ? "Keep your skills, pricing and availability updated so customers can find and book your services."
                : "Add your skills, pricing, availability and portfolio so customers can discover you."}
            </p>

          </div>

          <button
            className="profile-action-button"
            onClick={() =>
              navigate("/provider-profile-edit")
            }
          >
            {profileComplete
              ? "Edit Profile →"
              : "Complete Profile →"}
          </button>

        </section>

      </main>
    </div>
  );
}

export default ProviderDashboard;