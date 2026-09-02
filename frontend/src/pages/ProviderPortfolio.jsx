import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProviderPortfolio() {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // ===============================
  // Get Token
  // ===============================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===============================
  // Fetch Portfolio
  // ===============================
  const fetchPortfolio = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/portfolio/my-portfolio",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPortfolio(response.data.portfolio);
      }
    } catch (error) {
      console.error(
        "Fetch Portfolio Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to load portfolio."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Load Portfolio
  // ===============================
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // ===============================
  // Add Portfolio Item
  // ===============================
  const handleAddPortfolio = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Work title is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/portfolio",
        {
          title,
          description,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPortfolio((prevPortfolio) => [
          response.data.portfolioItem,
          ...prevPortfolio,
        ]);

        setTitle("");
        setDescription("");
        setImageUrl("");

        setShowForm(false);

        setMessage(
          "Portfolio item added successfully."
        );
      }
    } catch (error) {
      console.error(
        "Add Portfolio Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to add portfolio item."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // Delete Portfolio Item
  // ===============================
  const handleDelete = async (portfolioId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this portfolio item?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/portfolio/${portfolioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPortfolio((prevPortfolio) =>
          prevPortfolio.filter(
            (item) => item._id !== portfolioId
          )
        );

        setMessage(
          "Portfolio item deleted successfully."
        );
      }
    } catch (error) {
      console.error(
        "Delete Portfolio Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to delete portfolio item."
      );
    }
  };

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="provider-profile-page">
        <div className="chat-empty">
          Loading portfolio...
        </div>
      </div>
    );
  }

  return (
    <div className="provider-profile-page">

      <div className="profile-header">
        <button
          className="back-button"
          onClick={() =>
            navigate("/provider-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <div>
          <p className="dashboard-label">
            MY PORTFOLIO
          </p>

          <h1>
            Showcase Your Work
          </h1>

          <p>
            Add your previous work and projects so
            customers can see your experience.
          </p>
        </div>
      </div>

      <div className="portfolio-top-action">
        <button
          className="profile-action-button"
          onClick={() => {
            setShowForm(true);
            setMessage("");
          }}
        >
          + Add Portfolio Item
        </button>
      </div>

      {message && (
        <div className="booking-message">
          {message}
        </div>
      )}

      {showForm && (
        <div className="booking-form-container">

          <h2>
            Add Portfolio Item
          </h2>

          <form onSubmit={handleAddPortfolio}>

            <div className="form-group">
              <label>
                Work Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Example: Modern Kitchen Plumbing"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the work you completed..."
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>
                Image URL (Optional)
              </label>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="booking-form-actions">

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Adding..."
                  : "Add Work"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="portfolio-list">

        {portfolio.length === 0 ? (

          <div className="booking-card">
            <div className="chat-empty">

              <h3>
                No portfolio items yet
              </h3>

              <p>
                Add your previous work to showcase
                your skills to customers.
              </p>

            </div>
          </div>

        ) : (

          <div className="portfolio-grid">

            {portfolio.map((item) => (

              <div
                className="portfolio-card"
                key={item._id}
              >

                {item.imageUrl ? (

                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="portfolio-image"
                  />

                ) : (

                  <div className="portfolio-placeholder">
                    📸
                  </div>

                )}

                <div className="portfolio-content">

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description ||
                      "No description provided."}
                  </p>

                  <button
                    className="delete-portfolio-button"
                    onClick={() =>
                      handleDelete(item._id)
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default ProviderPortfolio;