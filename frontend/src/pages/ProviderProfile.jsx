import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ProviderProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const provider = location.state?.provider;

  const [showBookingForm, setShowBookingForm] =
    useState(false);

  const [bookingDate, setBookingDate] = useState("");
  const [description, setDescription] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // ===============================
  // Provider Not Found
  // ===============================
  if (!provider) {
    return (
      <div className="provider-profile-page">
        <div className="booking-form-container">
          <h2>Provider not found</h2>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // Handle Booking
  // ===============================
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!bookingDate) {
      setBookingMessage(
        "Please select a date and time."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    try {
      const response = await axios.post(
        "https://skillsphere-backend-58ha.onrender.com/api/bookings",
        {
          providerId: provider.user?._id,
          service:
            provider.skills?.[0] || "Service",
          description: description,
          bookingDate: bookingDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBookingMessage(
          "Booking created successfully! 🎉"
        );

        setBookingDate("");
        setDescription("");
      }
    } catch (error) {
      console.error("Booking Error:", error);

      setBookingMessage(
        error.response?.data?.message ||
          "Unable to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ===============================
  // Open Chat
  // ===============================
  const handleChat = () => {
    navigate("/chat");
  };

  return (
    <div className="provider-profile-page">

      {/* ===============================
          Header
      =============================== */}

      <div className="profile-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back
        </button>

        <div className="provider-main-info">

          <div className="provider-avatar-large">
            {provider.user?.fullName
              ? provider.user.fullName
                  .charAt(0)
                  .toUpperCase()
              : "P"}
          </div>

          <div>
            <h1>
              {provider.user?.fullName ||
                "Provider"}
            </h1>

            <p>
              🛠️{" "}
              {provider.skills?.join(", ") ||
                "Professional Service"}
            </p>

            <p>
              📍{" "}
              {provider.location ||
                "Location not available"}
            </p>

            <p>
              ⭐{" "}
              {provider.rating ||
                "New"}
            </p>
          </div>

        </div>
      </div>

      {/* ===============================
          Provider Details
      =============================== */}

      <div className="profile-details">

        <div className="detail-card">
          <h3>About</h3>

          <p>
            {provider.bio ||
              "No bio available"}
          </p>
        </div>

        <div className="detail-card">
          <h3>Experience</h3>

          <p>
            {provider.experience || 0} years
          </p>
        </div>

        <div className="detail-card">
          <h3>Price</h3>

          <p>
            ₹{provider.price || 0}
          </p>
        </div>

        <div className="detail-card">
          <h3>Service Radius</h3>

          <p>
            {provider.serviceRadius || 0} km
          </p>
        </div>

      </div>

      {/* ===============================
          Portfolio
      =============================== */}

      <div className="provider-portfolio-section">

        <h2>Portfolio</h2>

        <p>
          Previous work and professional
          experience.
        </p>

        {!provider.portfolio ||
        provider.portfolio.length === 0 ? (
          <div className="portfolio-empty">
            <p>
              No portfolio items added yet.
            </p>
          </div>
        ) : (
          <div className="portfolio-grid">

            {provider.portfolio.map(
              (item) => (
                <div
                  className="portfolio-card"
                  key={item._id}
                >

                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="portfolio-image"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  )}

                  <h3>
                    {item.title}
                  </h3>

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ===============================
          Actions
      =============================== */}

      <div className="profile-actions">

        <button
          className="book-button"
          onClick={() => {
            setShowBookingForm(true);
            setBookingMessage("");
          }}
        >
          Book Service
        </button>

        <button
          className="chat-button"
          onClick={handleChat}
        >
          Chat
        </button>

      </div>

      {/* ===============================
          Booking Form
      =============================== */}

      {showBookingForm && (
        <div className="booking-form-container">

          <h2>
            Book{" "}
            {provider.user?.fullName}
          </h2>

          <p>
            Service:{" "}
            <strong>
              {provider.skills?.[0] ||
                "Service"}
            </strong>
          </p>

          <p>
            Price:{" "}
            <strong>
              ₹{provider.price || 0}
            </strong>
          </p>

          <form onSubmit={handleBooking}>

            <div className="form-group">

              <label>
                Select Date & Time
              </label>

              <input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) =>
                  setBookingDate(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Describe your requirement
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Example: Repair my leaking kitchen tap"
                rows="4"
              />

            </div>

            <div className="booking-form-actions">

              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={bookingLoading}
              >
                {bookingLoading
                  ? "Booking..."
                  : "Confirm Booking"}
              </button>

            </div>

          </form>

          {bookingMessage && (
            <div className="booking-message">
              {bookingMessage}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default ProviderProfile;