import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProviderProfileEdit() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [portfolio, setPortfolio] = useState([]);
  const [addingPortfolio, setAddingPortfolio] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState("");

  const [portfolioData, setPortfolioData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [formData, setFormData] = useState({
  skills: "",
  bio: "",
  experience: "",
  price: "",
  location: "",
  latitude: "",
  longitude: "",
  serviceRadius: "",
  availability: true,
});
  // ===============================
  // Load Provider Profile
  // ===============================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
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

          setFormData({
  skills: provider.skills?.join(", ") || "",
  bio: provider.bio || "",
  experience: provider.experience || "",
  price: provider.price || "",
  location: provider.location || "",
  latitude: provider.latitude ?? "",
  longitude: provider.longitude ?? "",
  serviceRadius: provider.serviceRadius || "",
  availability: provider.availability ?? true,
});

          setPortfolio(provider.portfolio || []);
        }
      } catch (error) {
        console.error(
          "Fetch Provider Profile Error:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Unable to load provider profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ===============================
  // Handle Profile Input Change
  // ===============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===============================
// Get Current Location
// ===============================
const handleGetLocation = () => {
  if (!navigator.geolocation) {
    setMessage(
      "Geolocation is not supported by your browser."
    );
    return;
  }

  setMessage("Getting your current location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } =
        position.coords;

      setFormData((prev) => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));

      setMessage(
        "Location detected successfully! 📍"
      );
    },
    (error) => {
      console.error(
        "Location Error:",
        error
      );

      setMessage(
        "Unable to get your location. Please allow location access."
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

  // ===============================
  // Save Profile
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.latitude === "" ||
      formData.longitude === ""
    ) {
      setMessage(
        "Please enter your latitude and longitude."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5000/api/providers/profile",
        {
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),

          bio: formData.bio,

          experience: Number(formData.experience),

          price: Number(formData.price),

          location: formData.location,

          latitude: Number(formData.latitude),

          longitude: Number(formData.longitude),

          serviceRadius: Number(formData.serviceRadius),

          availability: formData.availability,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(
          "Profile updated successfully! 🎉"
        );
      }
    } catch (error) {
      console.error(
        "Update Provider Profile Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // Portfolio Input Change
  // ===============================
  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;

    setPortfolioData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // Add Portfolio Item
  // ===============================
  const handleAddPortfolio = async (e) => {
    e.preventDefault();

    if (!portfolioData.title.trim()) {
      setPortfolioMessage(
        "Please enter a portfolio title."
      );
      return;
    }

    try {
      setAddingPortfolio(true);
      setPortfolioMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/providers/portfolio",
        portfolioData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPortfolio(response.data.portfolio);

        setPortfolioData({
          title: "",
          description: "",
          image: "",
        });

        setPortfolioMessage(
          "Portfolio item added successfully! 🎉"
        );
      }
    } catch (error) {
      console.error(
        "Add Portfolio Error:",
        error
      );

      setPortfolioMessage(
        error.response?.data?.message ||
          "Unable to add portfolio item."
      );
    } finally {
      setAddingPortfolio(false);
    }
  };

  // ===============================
  // Delete Portfolio Item
  // ===============================
  const handleDeletePortfolio = async (
    portfolioId
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this portfolio item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/providers/portfolio/${portfolioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPortfolio(response.data.portfolio);

        setPortfolioMessage(
          "Portfolio item deleted successfully."
        );
      }
    } catch (error) {
      console.error(
        "Delete Portfolio Error:",
        error
      );

      setPortfolioMessage(
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
      <div className="bookings-page">
        <div className="chat-empty">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="provider-profile-page">

      {/* ===============================
          Header
      =============================== */}

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
            PROVIDER PROFILE
          </p>

          <h1>Edit Your Profile</h1>

          <p>
            Update your skills, pricing and service
            information.
          </p>
        </div>

      </div>

      {/* ===============================
          Professional Information
      =============================== */}

      <div className="booking-form-container">

        <h2>Professional Information</h2>

        <form onSubmit={handleSubmit}>

          {/* Skills */}

          <div className="form-group">

            <label>Skills</label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Example: Plumber, Electrician"
            />

            <small>
              Separate multiple skills with commas.
            </small>

          </div>

          {/* Bio */}

          <div className="form-group">

            <label>About You</label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell customers about yourself..."
            />

          </div>

          {/* Experience */}

          <div className="form-group">

            <label>
              Experience (Years)
            </label>

            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
            />

          </div>

          {/* Price */}

          <div className="form-group">

            <label>
              Service Price (₹)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
            />

          </div>

          {/* Location */}

          <div className="form-group">

            <label>Location</label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Example: Delhi"
            />

          </div>

          <button
            type="button"
            className="location-button"
            onClick={handleGetLocation}
          >
            📍 Use My Current Location
          </button>

          {/* Latitude */}

          <div className="form-group">

            <label>Latitude</label>

            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              min="-90"
              max="90"
              placeholder="Example: 28.6139"
            />

            <small>
              Latitude must be between -90 and 90.
            </small>

          </div>

          {/* Longitude */}

          <div className="form-group">

            <label>Longitude</label>

            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              min="-180"
              max="180"
              placeholder="Example: 77.2090"
            />

            <small>
              Longitude must be between -180 and 180.
            </small>

          </div>

          {/* Service Radius */}

          <div className="form-group">

            <label>
              Service Radius (KM)
            </label>

            <input
              type="number"
              name="serviceRadius"
              value={formData.serviceRadius}
              onChange={handleChange}
              min="0"
            />

          </div>

          {/* Availability */}

          <div className="form-group">

            <label>

              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />

              {" "}Currently available for bookings

            </label>

          </div>

          {/* Actions */}

          <div className="booking-form-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/provider-dashboard")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

        {message && (
          <div className="booking-message">
            {message}
          </div>
        )}

      </div>

      {/* ===============================
          Portfolio Section
      =============================== */}

      <div className="provider-portfolio-section">

        <h2>Manage Portfolio</h2>

        <p>
          Add your previous work and projects so
          customers can see your experience.
        </p>

        {/* Add Portfolio Form */}

        <form
          className="portfolio-form"
          onSubmit={handleAddPortfolio}
        >

          <div className="form-group">

            <label>Portfolio Title</label>

            <input
              type="text"
              name="title"
              value={portfolioData.title}
              onChange={handlePortfolioChange}
              placeholder="Example: Laptop Screen Replacement"
            />

          </div>

          <div className="form-group">

            <label>Description</label>

            <textarea
              name="description"
              value={portfolioData.description}
              onChange={handlePortfolioChange}
              rows="4"
              placeholder="Describe the work you completed..."
            />

          </div>

          <div className="form-group">

            <label>Image URL (Optional)</label>

            <input
              type="text"
              name="image"
              value={portfolioData.image}
              onChange={handlePortfolioChange}
              placeholder="Paste an image URL"
            />

          </div>

          <button
            type="submit"
            className="profile-action-button"
            disabled={addingPortfolio}
          >
            {addingPortfolio
              ? "Adding..."
              : "Add Portfolio Item"}
          </button>

        </form>

        {portfolioMessage && (
          <div className="booking-message">
            {portfolioMessage}
          </div>
        )}

        {/* Existing Portfolio Items */}

        {portfolio.length === 0 ? (
          <div className="booking-empty">

            <div className="empty-icon">
              📸
            </div>

            <h3>
              No portfolio items yet
            </h3>

            <p>
              Add your previous work to showcase
              your skills.
            </p>

          </div>
        ) : (
          <div className="portfolio-grid">

            {portfolio.map((item) => (
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

                <button
                  type="button"
                  className="reject-button"
                  onClick={() =>
                    handleDeletePortfolio(
                      item._id
                    )
                  }
                >
                  Delete
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default ProviderProfileEdit;