import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState({});

  // Review states
  const [selectedRating, setSelectedRating] = useState({});
  const [reviewComment, setReviewComment] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(null);
  const [reviewMessage, setReviewMessage] = useState({});
  const [reviewedBookings, setReviewedBookings] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

 const fetchBookings = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const response = await axios.get(
      "http://localhost:5000/api/bookings/my-bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      const bookingList = response.data.bookings;

      setBookings(bookingList);

      const reviewStatus = {};

      for (const booking of bookingList) {
        if (booking.status !== "completed") {
          continue;
        }

        try {
          const reviewResponse = await axios.get(
            `http://localhost:5000/api/reviews/provider/${booking.provider._id}`
          );

          if (reviewResponse.data.success) {
            const reviews =
              reviewResponse.data.reviews || [];

            const matchingReview = reviews.find(
              (review) =>
                String(review.booking) ===
                String(booking._id)
            );

            if (matchingReview) {
              reviewStatus[booking._id] = true;
            } else {
              reviewStatus[booking._id] = false;
            }
          }
        } catch (reviewError) {
          console.error(
            "Review Check Error:",
            reviewError
          );

          reviewStatus[booking._id] = false;
        }
      }

      setReviewedBookings(reviewStatus);
    }
  } catch (error) {
    console.error("Bookings Error:", error);

    setMessage(
      error.response?.data?.message ||
        "Unable to load bookings."
    );
  } finally {
    setLoading(false);
  }
};
  // ===============================
  // Submit Review
  // ===============================
  const submitReview = async (bookingId) => {
    const token = localStorage.getItem("token");

    const rating = selectedRating[bookingId];
    const comment = reviewComment[bookingId] || "";

    if (!rating) {
      setReviewMessage((prev) => ({
        ...prev,
        [bookingId]: "Please select a rating.",
      }));

      return;
    }

    try {
      setReviewSubmitting(bookingId);

      setReviewMessage((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          bookingId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReviewedBookings((prev) => ({
          ...prev,
          [bookingId]: true,
        }));

        setReviewMessage((prev) => ({
          ...prev,
          [bookingId]:
            "Review submitted successfully! ⭐",
        }));
      }
    } catch (error) {
      console.error("Review Error:", error);

      setReviewMessage((prev) => ({
        ...prev,
        [bookingId]:
          error.response?.data?.message ||
          "Unable to submit review.",
      }));
    } finally {
      setReviewSubmitting(null);
    }
  };


    // ===============================
  // Razorpay Payment
  // ===============================
  const handlePayment = async (booking) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPaymentLoading(booking._id);

      setPaymentMessage((prev) => ({
        ...prev,
        [booking._id]: "",
      }));

      // Create Razorpay order
      const response = await axios.post(
        "http://localhost:5000/api/payments/create-order",
        {
          bookingId: booking._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Unable to create payment order"
        );
      }

      const { order, key } = response.data;

      // Razorpay Checkout
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "SkillSphere",
        description: `${booking.service} Service`,
        order_id: order.id,
          config: {
    display: {
      blocks: {
        upi: {
          name: "Pay using UPI",
          instruments: [
            {
              method: "upi",
            },
          ],
        },
      },
      sequence: ["block.upi", "block.other"],
      preferences: {
        show_default_blocks: true,
      },
    },
  },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse =
              await axios.post(
                "http://localhost:5000/api/payments/verify",
                {
                  bookingId: booking._id,
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

            if (verifyResponse.data.success) {
              setBookings((prev) =>
                prev.map((item) =>
                  item._id === booking._id
                    ? {
                        ...item,
                        paymentStatus: "paid",
                        razorpayPaymentId:
                          paymentResponse.razorpay_payment_id,
                      }
                    : item
                )
              );

              setPaymentMessage((prev) => ({
                ...prev,
                [booking._id]:
                  "Payment successful! 🎉",
              }));
            }
          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            setPaymentMessage((prev) => ({
              ...prev,
              [booking._id]:
                error.response?.data?.message ||
                "Payment verification failed.",
            }));
          } finally {
            setPaymentLoading(null);
          }
        },

        prefill: {
          name:
            JSON.parse(
              localStorage.getItem("user") || "{}"
            )?.fullName || "",
          email:
            JSON.parse(
              localStorage.getItem("user") || "{}"
            )?.email || "",
        },

        theme: {
          color: "#7c3aed",
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(null);

            setPaymentMessage((prev) => ({
              ...prev,
              [booking._id]:
                "Payment cancelled.",
            }));
          },
        },
      };

      const razorpay = new window.Razorpay(
        options
      );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment Failed:",
            response.error
          );

          setPaymentMessage((prev) => ({
            ...prev,
            [booking._id]:
              response.error?.description ||
              "Payment failed.",
          }));

          setPaymentLoading(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      setPaymentMessage((prev) => ({
        ...prev,
        [booking._id]:
          error.response?.data?.message ||
          error.message ||
          "Unable to start payment.",
      }));

      setPaymentLoading(null);
    }
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    return `booking-status status-${status}`;
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">

      {/* Header */}

      <nav className="bookings-navbar">

        <div className="dashboard-brand">
          <div className="dashboard-logo">S</div>
          <span>SkillSphere</span>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>

      {/* Main Content */}

      <main className="bookings-content">

        <div className="bookings-header">

          <div>
            <p className="dashboard-label">
              CUSTOMER DASHBOARD
            </p>

            <h1>My Bookings</h1>

            <p>
              Track your upcoming and previous
              service bookings.
            </p>
          </div>

          <div className="booking-count">
            {bookings.length}{" "}
            {bookings.length === 1
              ? "Booking"
              : "Bookings"}
          </div>

        </div>

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        {/* Empty State */}

        {!message && bookings.length === 0 && (
          <div className="empty-bookings">

            <div className="empty-icon">📅</div>

            <h2>No bookings yet</h2>

            <p>
              Find a professional and book a service
              to get started.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
            >
              Find a Professional
            </button>

          </div>
        )}

        {/* Booking List */}

        <div className="bookings-list">

          {bookings.map((booking) => (

            <div
              className="booking-card"
              key={booking._id}
            >

              {/* Provider */}

              <div className="booking-provider">

                <div className="provider-avatar">
                  {booking.provider?.fullName
                    ?.charAt(0)
                    .toUpperCase() || "P"}
                </div>

                <div>
                  <h2>
                    {booking.provider?.fullName ||
                      "Provider"}
                  </h2>

                  <p>
                    {booking.provider?.email}
                  </p>
                </div>

              </div>

              {/* Booking Details */}

              <div className="booking-details">

                <div>
                  <span>Service</span>

                  <strong>
                    🛠️ {booking.service}
                  </strong>
                </div>

                <div>
                  <span>Date & Time</span>

                  <strong>
                    📅 {formatDate(
                      booking.bookingDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Price</span>

                  <strong>
                    ₹{booking.price}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

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
                      <div>
  <span>Payment</span>

  <strong
    className={
      booking.paymentStatus === "paid"
        ? "payment-paid"
        : "payment-pending"
    }
  >
    {booking.paymentStatus === "paid"
      ? "💳 Paid"
      : booking.status === "accepted"
      ? "⏳ Pending"
      : "—"}
  </strong>
</div>
              </div>

              {/* Description */}

              {booking.description && (
                <div className="booking-description">

                  <span>Requirement</span>

                  <p>
                    {booking.description}
                  </p>

                </div>
              )}
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
{booking.status === "accepted" &&
  booking.paymentStatus !== "paid" && (
    <button
      className="pay-now-button"
      onClick={() => handlePayment(booking)}
      disabled={paymentLoading === booking._id}
    >
      {paymentLoading === booking._id
        ? "Processing..."
        : `💳 Pay ₹${booking.price}`}
    </button>
  )}

{booking.paymentStatus === "paid" && (
  <div className="payment-success">
    ✅ Payment Completed
  </div>
)}

{paymentMessage[booking._id] && (
  <p className="payment-message">
    {paymentMessage[booking._id]}
  </p>
)}

              {/* ===============================
                  Rating & Review
              =============================== */}

              {booking.status === "completed" && (
                <div className="review-section">

                  {!reviewedBookings[booking._id] ? (
                    <>
                      <div className="review-heading">
                        <div>
                          <span className="review-badge">
                            SERVICE COMPLETED
                          </span>

                          <h3>
                            How was your experience?
                          </h3>

                          <p>
                            Rate your experience with{" "}
                            {booking.provider?.fullName ||
                              "this professional"}.
                          </p>
                        </div>
                      </div>

                      {/* Stars */}

                      <div className="rating-stars">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              type="button"
                              key={star}
                              className={
                                selectedRating[
                                  booking._id
                                ] >= star
                                  ? "star selected"
                                  : "star"
                              }
                              onClick={() =>
                                setSelectedRating(
                                  (prev) => ({
                                    ...prev,
                                    [booking._id]:
                                      star,
                                  })
                                )
                              }
                            >
                              ★
                            </button>
                          )
                        )}

                      </div>

                      {/* Comment */}

                      <textarea
                        className="review-textarea"
                        value={
                          reviewComment[
                            booking._id
                          ] || ""
                        }
                        onChange={(e) =>
                          setReviewComment(
                            (prev) => ({
                              ...prev,
                              [booking._id]:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Write a review about your experience..."
                        rows="4"
                      />

                      {/* Submit */}

                      <button
                        className="review-submit-button"
                        disabled={
                          reviewSubmitting ===
                          booking._id
                        }
                        onClick={() =>
                          submitReview(
                            booking._id
                          )
                        }
                      >
                        {reviewSubmitting ===
                        booking._id
                          ? "Submitting..."
                          : "Submit Review ⭐"}
                      </button>

                      {reviewMessage[
                        booking._id
                      ] && (
                        <p className="review-message">
                          {
                            reviewMessage[
                              booking._id
                            ]
                          }
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="review-success">

                      <span>⭐</span>

                      <div>
                        <h3>
                          Thank you for your review!
                        </h3>

                        <p>
                          Your feedback has been
                          submitted successfully.
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Bookings;