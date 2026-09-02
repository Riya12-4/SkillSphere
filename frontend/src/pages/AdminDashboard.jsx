import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ===============================
  // Load Admin Data
  // ===============================
  useEffect(() => {
    fetchDashboardStats();
    fetchProviders();
    fetchCustomers();
    fetchBookings();
    fetchReviews();
  }, []);

  // ===============================
  // Get Token
  // ===============================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===============================
  // Dashboard Stats
  // ===============================
  const fetchDashboardStats = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Admin Dashboard Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Fetch Providers
  // ===============================
  const fetchProviders = async () => {
    const token = getToken();

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/admin/providers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProviders(response.data.providers);
      }
    } catch (error) {
      console.error("Fetch Providers Error:", error);
    }
  };

  // ===============================
  // Fetch Customers
  // ===============================
  const fetchCustomers = async () => {
    const token = getToken();

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Fetch Customers Error:", error);
    }
  };

  // ===============================
  // Fetch Bookings
  // ===============================
  const fetchBookings = async () => {
    const token = getToken();

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/admin/bookings",
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
      console.error("Fetch Bookings Error:", error);
    }
  };

  // ===============================
// Fetch Reviews
// ===============================
const fetchReviews = async () => {
  const token = getToken();

  try {
    const response = await axios.get(
      "https://skillsphere-backend-58ha.onrender.com/api/admin/reviews",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setReviews(response.data.reviews);
    }
  } catch (error) {
    console.error(
      "Fetch Reviews Error:",
      error
    );
  }
};

  // ===============================
  // Verify Provider
  // ===============================
  const handleVerifyProvider = async (providerId) => {
    const token = getToken();

    try {
      const response = await axios.put(
        `https://skillsphere-backend-58ha.onrender.com/api/admin/providers/${providerId}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchProviders();
      }
    } catch (error) {
      console.error("Verify Provider Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update provider verification."
      );
    }
  };

  // ===============================
  // Customer Status
  // ===============================
  const handleCustomerStatus = async (customerId) => {
    const token = getToken();

    try {
      const response = await axios.put(
        `https://skillsphere-backend-58ha.onrender.com/api/admin/customers/${customerId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Customer Status Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update customer status."
      );
    }
  };

  // ===============================
  // Logout
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ===============================
  // Format Date
  // ===============================
  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="bookings-page">
        <div className="chat-empty">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  // ===============================
  // Sidebar Item
  // ===============================
  const SidebarItem = ({ id, icon, label }) => {
    return (
      <button
        type="button"
        className={`admin-sidebar-item ${
          activeSection === id ? "active" : ""
        }`}
        onClick={() => {
          setActiveSection(id);
          setMessage("");
        }}
      >
        <span className="admin-sidebar-icon">
          {icon}
        </span>

        <span>{label}</span>
      </button>
    );
  };

  // ===============================
  // Dashboard Content
  // ===============================
  const DashboardSection = () => {
    return (
      <>
        <div className="bookings-header">
          <div>
            <p className="dashboard-label">
              ADMIN DASHBOARD
            </p>

            <h1>
              Welcome, Admin 👋
            </h1>

            <p>
              Monitor SkillSphere users,
              providers, bookings and payments.
            </p>
          </div>
        </div>

        {stats && (
          <div className="provider-stats">

            <div className="stat-card">
              <span>👥</span>

              <p>
                Total Customers
              </p>

              <h2>
                {stats.totalUsers}
              </h2>
            </div>

            <div className="stat-card">
              <span>🧑‍🔧</span>

              <p>
                Total Providers
              </p>

              <h2>
                {stats.totalProviders}
              </h2>
            </div>

            <div className="stat-card">
              <span>📅</span>

              <p>
                Total Bookings
              </p>

              <h2>
                {stats.totalBookings}
              </h2>
            </div>

            <div className="stat-card">
              <span>💰</span>

              <p>
                Paid Revenue
              </p>

              <h2>
                ₹{stats.totalRevenue}
              </h2>
            </div>

          </div>
        )}

        {stats && (
          <div
            className="bookings-list"
            style={{
              marginTop: "30px",
            }}
          >
            <div className="booking-card">

              <div className="booking-provider">

                <div className="provider-avatar">
                  📊
                </div>

                <div>
                  <h2>
                    Booking Overview
                  </h2>

                  <p>
                    Current platform booking statistics
                  </p>
                </div>

              </div>

              <div className="booking-details">

                <div>
                  <span>Pending</span>

                  <strong>
                    {stats.pendingBookings}
                  </strong>
                </div>

                <div>
                  <span>Accepted</span>

                  <strong>
                    {stats.acceptedBookings}
                  </strong>
                </div>

                <div>
                  <span>Completed</span>

                  <strong>
                    {stats.completedBookings}
                  </strong>
                </div>

                <div>
                  <span>Rejected</span>

                  <strong>
                    {stats.rejectedBookings || 0}
                  </strong>
                </div>

                <div>
                  <span>Cancelled</span>

                  <strong>
                    {stats.cancelledBookings || 0}
                  </strong>
                </div>

              </div>

            </div>
          </div>
        )}
      </>
    );
  };

  // ===============================
  // Customers Section
  // ===============================
  const CustomersSection = () => {
    return (
      <>
        <div className="bookings-header">

          <div>
            <p className="dashboard-label">
              CUSTOMER MANAGEMENT
            </p>

            <h1>
              Customers
            </h1>

            <p>
              Manage all registered SkillSphere customers.
            </p>
          </div>

        </div>

        <div className="bookings-list">

          {customers.length === 0 ? (
            <div className="booking-card">
              <div className="chat-empty">
                No customers found.
              </div>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                className="booking-card"
                key={customer._id}
              >

                <div className="booking-provider">

                  <div className="provider-avatar">
                    👤
                  </div>

                  <div>
                    <h2>
                      {customer.fullName}
                    </h2>

                    <p>
                      {customer.email}
                    </p>

                    <p>
                      📞 {customer.phone}
                    </p>
                  </div>

                </div>

                <div className="admin-action-row">

                  <strong>
                    {customer.isActive
                      ? "✓ Active"
                      : "✕ Inactive"}
                  </strong>

                  <button
                    className="back-button"
                    onClick={() =>
                      handleCustomerStatus(
                        customer._id
                      )
                    }
                  >
                    {customer.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              </div>
            ))
          )}

        </div>
      </>
    );
  };

  // ===============================
  // Providers Section
  // ===============================
  const ProvidersSection = () => {
    return (
      <>
        <div className="bookings-header">

          <div>
            <p className="dashboard-label">
              PROVIDER MANAGEMENT
            </p>

            <h1>
              Providers
            </h1>

            <p>
              Verify and manage SkillSphere service providers.
            </p>
          </div>

        </div>

        <div className="bookings-list">

          {providers.length === 0 ? (
            <div className="booking-card">
              <div className="chat-empty">
                No providers found.
              </div>
            </div>
          ) : (
            providers.map((provider) => (
              <div
                className="booking-card"
                key={provider._id}
              >

                <div className="booking-provider">

                  <div className="provider-avatar">
                    🧑‍🔧
                  </div>

                  <div>
                    <h2>
                      {provider.user?.fullName ||
                        "Unknown Provider"}
                    </h2>

                    <p>
                      {provider.user?.email ||
                        "No email"}
                    </p>

                    <p>
                      🛠️{" "}
                      {provider.skills?.join(", ") ||
                        "No skills"}{" "}
                      · 📍{" "}
                      {provider.location ||
                        "Location not added"}
                    </p>
                  </div>

                </div>

                <div className="admin-action-row">

                  <strong>
                    {provider.user?.isVerified
                      ? "✓ Verified"
                      : "⚠ Not Verified"}
                  </strong>

                  <button
                    className="back-button"
                    onClick={() =>
                      handleVerifyProvider(
                        provider._id
                      )
                    }
                  >
                    {provider.user?.isVerified
                      ? "Unverify"
                      : "Verify"}
                  </button>

                </div>

              </div>
            ))
          )}

        </div>
      </>
    );
  };

  // ===============================
  // Bookings Section
  // ===============================
  const BookingsSection = () => {
    return (
      <>
        <div className="bookings-header">

          <div>
            <p className="dashboard-label">
              BOOKING MANAGEMENT
            </p>

            <h1>
              Bookings
            </h1>

            <p>
              Monitor all customer bookings and payments.
            </p>
          </div>

        </div>

        <div className="bookings-list">

          {bookings.length === 0 ? (
            <div className="booking-card">
              <div className="chat-empty">
                No bookings found.
              </div>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                className="booking-card"
                key={booking._id}
              >

                <div className="booking-provider">

                  <div className="provider-avatar">
                    📅
                  </div>

                  <div>
                    <h2>
                      {booking.service ||
                        "Service Booking"}
                    </h2>

                    <p>
                      Booking ID: {booking._id}
                    </p>
                  </div>

                </div>

                <div
                  className="booking-details"
                  style={{
                    marginTop: "20px",
                  }}
                >

                  <div>
                    <span>
                      Customer
                    </span>

                    <strong>
                      {booking.customer?.fullName ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Provider
                    </span>

                    <strong>
                      {booking.provider?.fullName ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Booking Date
                    </span>

                    <strong>
                      {formatDate(
                        booking.bookingDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Price
                    </span>

                    <strong>
                      ₹{booking.price || 0}
                    </strong>
                  </div>

                </div>

                {booking.description && (
                  <p
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <strong>
                      Description:
                    </strong>{" "}
                    {booking.description}
                  </p>
                )}

                <div className="admin-status-row">

                  <span>
                    Status:{" "}
                    {booking.status}
                  </span>

                  <span>
                    Payment:{" "}
                    {booking.paymentStatus ||
                      "pending"}
                  </span>

                </div>

              </div>
            ))
          )}

        </div>
      </>
    );
  };

  // ===============================
// Reviews Section
// ===============================
const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const token = getToken();

    try {
      const response = await axios.get(
        "https://skillsphere-backend-58ha.onrender.com/api/admin/reviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Fetch Reviews Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    try {
      const response = await axios.delete(
        `https://skillsphere-backend-58ha.onrender.com/api/admin/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReviews((prevReviews) =>
          prevReviews.filter(
            (review) => review._id !== reviewId
          )
        );

        setMessage("Review deleted successfully.");
      }
    } catch (error) {
      console.error("Delete Review Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  return (
    <>
      <div className="bookings-header">
        <div>
          <p className="dashboard-label">
            REVIEW MANAGEMENT
          </p>

          <h1>
            Reviews
          </h1>

          <p>
            Monitor and moderate customer reviews.
          </p>
        </div>
      </div>

      {reviewsLoading ? (
        <div className="booking-card">
          <div className="chat-empty">
            Loading reviews...
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="booking-card">
          <div className="chat-empty">
            No reviews found.
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {reviews.map((review) => (
            <div
              className="booking-card"
              key={review._id}
            >
              <div className="booking-provider">

                <div className="provider-avatar">
                  ⭐
                </div>

                <div>
                  <h2>
                    {review.provider?.fullName ||
                      "Unknown Provider"}
                  </h2>

                  <p>
                    Customer:{" "}
                    {review.customer?.fullName ||
                      "Unknown Customer"}
                  </p>

                  <p>
                    {review.customer?.email ||
                      "No email"}
                  </p>
                </div>

              </div>

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    marginBottom: "8px",
                  }}
                >
                  {"⭐".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p>
                  <strong>
                    Rating: {review.rating}/5
                  </strong>
                </p>

                <p>
                  {review.comment ||
                    "No comment provided."}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  Review ID: {review._id}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteReview(review._id)
                  }
                  style={{
                    padding: "9px 16px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Delete Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ===============================
// Payments Section
// ===============================
const PaymentsSection = () => {
  const paidBookings = bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid"
  );

  const pendingPayments = bookings.filter(
    (booking) =>
      !booking.paymentStatus ||
      booking.paymentStatus === "pending"
  );

  const totalPaidAmount = paidBookings.reduce(
    (total, booking) =>
      total + Number(booking.price || 0),
    0
  );

  return (
    <>
      <div className="bookings-header">
        <div>
          <p className="dashboard-label">
            PAYMENT MANAGEMENT
          </p>

          <h1>
            Payments
          </h1>

          <p>
            Monitor SkillSphere payment transactions.
          </p>
        </div>
      </div>

      {/* Payment Stats */}

      <div className="provider-stats">

        <div className="stat-card">
          <span>💰</span>

          <p>
            Total Paid
          </p>

          <h2>
            ₹{totalPaidAmount}
          </h2>
        </div>

        <div className="stat-card">
          <span>✅</span>

          <p>
            Successful Payments
          </p>

          <h2>
            {paidBookings.length}
          </h2>
        </div>

        <div className="stat-card">
          <span>⏳</span>

          <p>
            Pending Payments
          </p>

          <h2>
            {pendingPayments.length}
          </h2>
        </div>

        <div className="stat-card">
          <span>📊</span>

          <p>
            Total Transactions
          </p>

          <h2>
            {bookings.length}
          </h2>
        </div>

      </div>

      {/* Payment Records */}

      <div
        className="bookings-list"
        style={{
          marginTop: "30px",
        }}
      >

        {bookings.length === 0 ? (
          <div className="booking-card">
            <div className="chat-empty">
              No payment records found.
            </div>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              className="booking-card"
              key={booking._id}
            >

              <div className="booking-provider">

                <div className="provider-avatar">
                  💳
                </div>

                <div>
                  <h2>
                    {booking.service ||
                      "Service Payment"}
                  </h2>

                  <p>
                    Customer:{" "}
                    {booking.customer?.fullName ||
                      "N/A"}
                  </p>

                  <p>
                    Provider:{" "}
                    {booking.provider?.fullName ||
                      "N/A"}
                  </p>
                </div>

              </div>

              <div
                className="booking-details"
                style={{
                  marginTop: "20px",
                }}
              >

                <div>
                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹{booking.price || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Status
                  </span>

                  <strong
                    style={{
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {booking.paymentStatus ||
                      "pending"}
                  </strong>
                </div>

                <div>
                  <span>
                    Booking Status
                  </span>

                  <strong
                    style={{
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {booking.status ||
                      "N/A"}
                  </strong>
                </div>

              </div>

              {/* Razorpay Details */}

              <div
                style={{
                  marginTop: "18px",
                }}
              >

                <p>
                  <strong>
                    Razorpay Order ID:
                  </strong>{" "}
                  {booking.razorpayOrderId ||
                    "Not available"}
                </p>

                <p>
                  <strong>
                    Razorpay Payment ID:
                  </strong>{" "}
                  {booking.razorpayPaymentId ||
                    "Not available"}
                </p>

                <p>
                  <strong>
                    Paid At:
                  </strong>{" "}
                  {booking.paidAt
                    ? formatDate(
                        booking.paidAt
                      )
                    : "Not paid"}
                </p>

              </div>

            </div>
          ))
        )}

      </div>
    </>
  );
};

const SettingsSection = () => {
  const adminUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return (
    <>
      <div className="bookings-header">
        <div>
          <p className="dashboard-label">
            ADMIN SETTINGS
          </p>

          <h1>
            Settings
          </h1>

          <p>
            Manage your SkillSphere admin account
            and platform information.
          </p>
        </div>
      </div>

      <div className="bookings-list">

        {/* Admin Profile */}

        <div className="booking-card">

          <div className="booking-provider">

            <div className="provider-avatar">
              👤
            </div>

            <div>
              <h2>
                Admin Profile
              </h2>

              <p>
                Your administrator account information.
              </p>
            </div>

          </div>

          <div
            className="booking-details"
            style={{
              marginTop: "20px",
            }}
          >

            <div>
              <span>
                Name
              </span>

              <strong>
                {adminUser.fullName ||
                  "Admin"}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {adminUser.email ||
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>
                Role
              </span>

              <strong
                style={{
                  textTransform:
                    "capitalize",
                }}
              >
                {adminUser.role ||
                  "admin"}
              </strong>
            </div>

          </div>

        </div>

        {/* Platform Information */}

        <div className="booking-card">

          <div className="booking-provider">

            <div className="provider-avatar">
              🌐
            </div>

            <div>
              <h2>
                Platform Information
              </h2>

              <p>
                Basic information about the
                SkillSphere platform.
              </p>
            </div>

          </div>

          <div
            className="booking-details"
            style={{
              marginTop: "20px",
            }}
          >

            <div>
              <span>
                Platform Name
              </span>

              <strong>
                SkillSphere
              </strong>
            </div>

            <div>
              <span>
                Platform Status
              </span>

              <strong>
                ✓ Active
              </strong>
            </div>

            <div>
              <span>
                User Management
              </span>

              <strong>
                Enabled
              </strong>
            </div>

          </div>

        </div>

        {/* Security */}

        <div className="booking-card">

          <div className="booking-provider">

            <div className="provider-avatar">
              🔐
            </div>

            <div>
              <h2>
                Security
              </h2>

              <p>
                Current admin account security status.
              </p>
            </div>

          </div>

          <div
            style={{
              marginTop: "20px",
            }}
          >

            <p>
              <strong>
                Authentication:
              </strong>{" "}
              JWT Authentication
            </p>

            <p>
              <strong>
                Access:
              </strong>{" "}
              Admin Only
            </p>

            <p>
              <strong>
                Account Status:
              </strong>{" "}
              ✓ Active
            </p>

          </div>

        </div>

      </div>
    </>
  );
};

  // ===============================
  // Coming Soon
  // ===============================
  const ComingSoonSection = ({
    title,
    icon,
  }) => {
    return (
      <>
        <div className="bookings-header">

          <div>
            <p className="dashboard-label">
              ADMIN PANEL
            </p>

            <h1>
              {icon} {title}
            </h1>

            <p>
              This section will be added next.
            </p>
          </div>

        </div>

        <div className="booking-card">
          <div className="chat-empty">
            {title} management coming next.
          </div>
        </div>
      </>
    );
  };

  // ===============================
  // Render Section
  // ===============================
  const renderSection = () => {
    switch (activeSection) {

      case "dashboard":
        return <DashboardSection />;

      case "customers":
        return <CustomersSection />;

      case "providers":
        return <ProvidersSection />;

      case "bookings":
        return <BookingsSection />;

      case "reviews":
        return <ReviewsSection />;

      case "payments":
        return <PaymentsSection />;

      case "settings":
        return <SettingsSection />;

      default:
        return <DashboardSection />;
    }
  };

  // ===============================
  // Main UI
  // ===============================
  return (
    <div className="admin-page">

      {/* ===============================
          Sidebar
      =============================== */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">

          <div className="dashboard-logo">
            S
          </div>

          <div>
            <strong>
              SkillSphere
            </strong>

            <p>
              Admin Panel
            </p>
          </div>

        </div>

        <div className="admin-sidebar-menu">

          <SidebarItem
            id="dashboard"
            icon="📊"
            label="Dashboard"
          />

          <SidebarItem
            id="customers"
            icon="👥"
            label="Customers"
          />

          <SidebarItem
            id="providers"
            icon="🧑‍🔧"
            label="Providers"
          />

          <SidebarItem
            id="bookings"
            icon="📅"
            label="Bookings"
          />

          <SidebarItem
            id="reviews"
            icon="⭐"
            label="Reviews"
          />

          <SidebarItem
            id="payments"
            icon="💳"
            label="Payments"
          />

          <SidebarItem
            id="settings"
            icon="⚙️"
            label="Settings"
          />

        </div>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* ===============================
          Main Area
      =============================== */}

      <div className="admin-main">

        <nav className="admin-navbar">

          <div>
            <strong>
              {activeSection === "dashboard" &&
                "Dashboard"}

              {activeSection === "customers" &&
                "Customer Management"}

              {activeSection === "providers" &&
                "Provider Management"}

              {activeSection === "bookings" &&
                "Booking Management"}

              {activeSection === "reviews" &&
                "Review Management"}

              {activeSection === "payments" &&
                "Payment Management"}

              {activeSection === "settings" &&
                "Admin Settings"}
            </strong>
          </div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Main Dashboard
          </button>

        </nav>

        <main className="admin-content">

          {message && (
            <div className="error-message">
              {message}
            </div>
          )}

          {renderSection()}

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;