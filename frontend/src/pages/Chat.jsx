import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // =====================================================
  // GET USER ID SAFELY
  // =====================================================
  const getUserId = (user) => {
    if (!user) return "";

    if (typeof user === "string") {
      return user;
    }

    return user._id || user.id || user.userId || "";
  };

  const currentUserId = getUserId(currentUser);

  // =====================================================
  // GET SENDER ID SAFELY
  // =====================================================
  const getSenderId = (sender) => {
    if (!sender) return "";

    if (typeof sender === "string") {
      return sender;
    }

    return sender._id || sender.id || "";
  };

  // =====================================================
  // FETCH MESSAGES
  // =====================================================
  const fetchMessages = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!booking?._id) {
      setErrorMessage("No booking selected.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${booking._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages || []);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Fetch Messages Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load messages."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================
  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [booking?._id]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================
  const sendMessage = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!text.trim()) {
      return;
    }

    if (!booking?._id) {
      setErrorMessage("No booking selected.");
      return;
    }

    // ===================================================
    // FIND RECEIVER
    // ===================================================

    let receiver = "";

    if (currentUser.role === "customer") {
      receiver = getUserId(booking.provider);
    } else {
      receiver = getUserId(booking.customer);
    }

    if (!receiver) {
      setErrorMessage("Receiver not found.");
      return;
    }

    try {
      setSending(true);
      setErrorMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver,
          booking: booking._id,
          text: text.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Add message immediately
        setMessages((prev) => [
          ...prev,
          response.data.data,
        ]);

        setText("");

        // Fetch again to make sure latest DB data is loaded
        setTimeout(() => {
          fetchMessages();
        }, 500);
      }
    } catch (error) {
      console.error("Send Message Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // NO BOOKING
  // =====================================================

  if (!booking) {
    return (
      <div className="bookings-page">

        <nav className="bookings-navbar">

          <div className="dashboard-brand">
            <div className="dashboard-logo">
              S
            </div>

            <span>SkillSphere</span>
          </div>

          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

        </nav>

        <main className="bookings-content">

          <div className="empty-bookings">

            <div className="empty-icon">
              💬
            </div>

            <h2>No booking selected</h2>

            <p>
              Open chat from a booking to start
              communicating.
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // FIND OTHER PERSON
  // =====================================================

  const otherPerson =
    currentUser.role === "customer"
      ? booking.provider
      : booking.customer;

  const otherName =
    typeof otherPerson === "object"
      ? otherPerson?.fullName || "User"
      : "User";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bookings-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bookings-navbar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            S
          </div>

          <span>SkillSphere</span>

        </div>

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </nav>

      {/* =================================================
          CHAT PAGE
      ================================================= */}

      <main className="chat-page-content">

        <div className="chat-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="chat-header">

            <div className="chat-user-avatar">

              {otherName
                .charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <h2>
                {otherName}
              </h2>

              <p>
                {booking.service} • Booking Chat
              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="chat-messages">

            {loading ? (

              <div className="chat-empty">
                Loading messages...
              </div>

            ) : messages.length === 0 ? (

              <div className="chat-empty">

                <div>
                  💬
                </div>

                <h3>
                  No messages yet
                </h3>

                <p>
                  Start the conversation with{" "}
                  {otherName}.
                </p>

              </div>

            ) : (

              messages.map((msg) => {

                // =========================================
                // IMPORTANT
                // sender can be:
                // "6a7c..."
                //
                // OR
                //
                // {
                //   _id: "6a7c..."
                // }
                // =========================================

                const senderId =
                  getSenderId(msg.sender);

                const isMine =
                  String(senderId) ===
                  String(currentUserId);

                return (
                  <div
                    key={msg._id}
                    className={`chat-message-row ${
                      isMine ? "mine" : "other"
                    }`}
                  >

                    <div className="chat-message">

                      <p>
                        {msg.text}
                      </p>

                      <span>
                        {new Date(
                          msg.createdAt
                        ).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>

                    </div>

                  </div>
                );
              })

            )}

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <form
            className="chat-input-area"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              placeholder={`Message ${otherName}...`}
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending || !text.trim()
              }
            >
              {sending
                ? "..."
                : "Send"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default Chat;