import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProviderBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingBooking, setUpdatingBooking] = useState(null);

  useEffect(() => {
    fetchProviderBookings();
  }, []);

  // ===============================
  // Fetch Provider Bookings
  // ===============================
  const fetchProviderBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/bookings/provider-bookings",
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
      console.error("Provider Bookings Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load booking requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Update Booking Status
  // ===============================
  const updateStatus = async (bookingId, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingBooking(bookingId);
      setMessage("");

      const response = await axios.put(
        `https://skillsphere-backend-58ha.onrender.com/api/bookings/${bookingId}/status`,
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
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status,
                }
              : booking
          )
        );
      }
    } catch (error) {
      console.error("Update Booking Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update booking."
      );
    } finally {
      setUpdatingBooking(null);
    }
  };

  // ===============================
  // Format Date
  // ===============================
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ===============================
  // Status Class
  // ===============================
  const getStatusClass = (status) => {
    return `booking-status status-${status}`;
  };

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="bookings-page">
        <nav className="bookings-navbar">
          <div className="dashboard-brand">
            <div className="dashboard-logo">S</div>
            <span>SkillSphere</span>
          </div>
        </nav>

        <main className="bookings-content">
          <p>Loading booking requests...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bookings-page">

      {/* ===============================
          Navbar
      =============================== */}

      <nav className="bookings-navbar">

        <div className="dashboard-brand">
          <div className="dashboard-logo">S</div>
          <span>SkillSphere</span>
        </div>

        <button
          className="back-button"
          onClick={() =>
            navigate("/provider-dashboard")
          }
        >
          ← Dashboard
        </button>

      </nav>

      {/* ===============================
          Main Content
      =============================== */}

      <main className="bookings-content">

        {/* Header */}

        <div className="bookings-header">

          <div>

            <p className="dashboard-label">
              PROVIDER DASHBOARD
            </p>

            <h1>Booking Requests</h1>

            <p>
              Manage your incoming service bookings
              and customer requests.
            </p>

          </div>

          <div className="booking-count">
            {bookings.length}{" "}
            {bookings.length === 1
              ? "Booking"
              : "Bookings"}
          </div>

        </div>

        {/* Error Message */}

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        {/* ===============================
            Empty State
        =============================== */}

        {!message && bookings.length === 0 && (
          <div className="empty-bookings">

            <div className="empty-icon">
              📋
            </div>

            <h2>No booking requests</h2>

            <p>
              New customer booking requests will
              appear here.
            </p>

          </div>
        )}

        {/* ===============================
            Booking List
        =============================== */}

        <div className="bookings-list">

          {bookings.map((booking) => (

            <div
              className="booking-card"
              key={booking._id}
            >

              {/* ===============================
                  Customer
              =============================== */}

              <div className="booking-provider">

                <div className="provider-avatar">

                  {booking.customer?.fullName
                    ?.charAt(0)
                    .toUpperCase() || "C"}

                </div>

                <div>

                  <h2>
                    {booking.customer?.fullName ||
                      "Customer"}
                  </h2>

                  <p>
                    {booking.customer?.email}
                  </p>

                  {booking.customer?.phone && (
                    <p>
                      📞 {booking.customer.phone}
                    </p>
                  )}

                </div>

              </div>

              {/* ===============================
                  Booking Details
              =============================== */}

              <div className="booking-details">

                {/* Service */}

                <div>

                  <span>
                    Service
                  </span>

                  <strong>
                    🛠️ {booking.service}
                  </strong>

                </div>

                {/* Date */}

                <div>

                  <span>
                    Date & Time
                  </span>

                  <strong>
                    📅{" "}
                    {formatDate(
                      booking.bookingDate
                    )}
                  </strong>

                </div>

                {/* Price */}

                <div>

                  <span>
                    Price
                  </span>

                  <strong>
                    ₹{booking.price}
                  </strong>

                </div>

                {/* Status */}

                <div>

                  <span>
                    Status
                  </span>

                  <strong
                    className={getStatusClass(
                      booking.status
                    )}
                  >
                    {booking.status
                      .charAt(0)
                      .toUpperCase() +
                      booking.status.slice(1)}
                  </strong>

                </div>

              </div>

              {/* ===============================
                  Customer Requirement
              =============================== */}

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

              {/* ===============================
                  Actions
              =============================== */}

              <div className="booking-footer">
                <button
  className="chat-booking-button"
  onClick={() =>
    navigate("/chat", {
      state: {
        booking: booking,
      },
    })
  }
>
  💬 Open Chat
</button>
                {/* Pending */}

                {booking.status === "pending" && (
                  <div className="booking-actions">

                    <button
                      className="accept-button"
                      disabled={
                        updatingBooking ===
                        booking._id
                      }
                      onClick={() =>
                        updateStatus(
                          booking._id,
                          "accepted"
                        )
                      }
                    >
                      {updatingBooking ===
                      booking._id
                        ? "Updating..."
                        : "✓ Accept"}
                    </button>

                    <button
                      className="reject-button"
                      disabled={
                        updatingBooking ===
                        booking._id
                      }
                      onClick={() =>
                        updateStatus(
                          booking._id,
                          "rejected"
                        )
                      }
                    >
                      {updatingBooking ===
                      booking._id
                        ? "Updating..."
                        : "✕ Reject"}
                    </button>

                  </div>
                )}

                {/* Accepted */}

                {booking.status === "accepted" && (
                  <div className="booking-actions">

                    <button
                      className="accept-button"
                      disabled={
                        updatingBooking ===
                        booking._id
                      }
                      onClick={() =>
                        updateStatus(
                          booking._id,
                          "completed"
                        )
                      }
                    >
                      {updatingBooking ===
                      booking._id
                        ? "Updating..."
                        : "✓ Mark as Completed"}
                    </button>

                  </div>
                )}

                {/* Rejected */}

                {booking.status === "rejected" && (
                  <div className="booking-message">
                    This booking request was rejected.
                  </div>
                )}

                {/* Completed */}

                {booking.status === "completed" && (
                  <div className="booking-message">
                    ✓ Service completed successfully.
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default ProviderBookings;