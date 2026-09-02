import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProviderMap from "../components/ProviderMap";

function Dashboard() {
   const navigate = useNavigate();

  const [user, setUser] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [providers, setProviders] = useState([]);

  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ===============================
  // AI Skill Search + Provider Search
  // ===============================
  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResult("Please describe the service you need.");
      setProviders([]);
      return;
    }

    setSearching(true);
    setSearchResult("");
    setProviders([]);

    try {
      // Step 1: AI identifies the required skill
      const aiResponse = await axios.post(
        "https://skillsphere-backend-58ha.onrender.com/api/ai/skill-search",
        {
          query: searchQuery,
        }
      );

      if (!aiResponse.data.success) {
        setSearchResult("No suitable skill found.");
        return;
      }

      const skill = aiResponse.data.skill;

      // Show identified skill
      setSearchResult(skill);

      // Step 2: Search matching providers
      const providerResponse = await axios.post(
        "https://skillsphere-backend-58ha.onrender.com/api/providers/search",
        {
          skill: skill,
        }
      );

      if (providerResponse.data.success) {
        setProviders(providerResponse.data.providers);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("AI Search Error:", error);

      setSearchResult(
        error.response?.data?.message ||
          "Unable to search for a professional."
      );

      setProviders([]);
    } finally {
      setSearching(false);
    }
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

      {/* ===============================
          Main Content
      =============================== */}
      <main className="dashboard-content">

        {/* Welcome */}
        <section className="welcome-section">

          <p className="dashboard-label">
            CUSTOMER DASHBOARD
          </p>

          <h1>
            Welcome back
            {user?.fullName
              ? `, ${user.fullName}`
              : ""}
            ! 👋
          </h1>

          <p>
            Find trusted professionals and services near you.
          </p>

        </section>

        {/* ===============================
            Dashboard Cards
        =============================== */}
        <section className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-icon">🔍</div>

            <h3>Explore Skills</h3>

            <p>
              Discover professionals based on the service you need.
            </p>

            <button>Explore</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📍</div>

            <h3>Nearby Professionals</h3>

            <p>
              Find skilled professionals available around your location.
            </p>

            <button>View Map</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📅</div>

            <h3>My Bookings</h3>

            <p>
              Track your upcoming and previous service bookings.
            </p>

            <button onClick={() => navigate("/bookings")}>
              View Bookings
          </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>

            <h3>Messages</h3>

            <p>
              Chat directly with your service providers.
            </p>

            <button>Open Chat</button>
          </div>

        </section>

        {/* ===============================
            AI Search
        =============================== */}
        <section className="ai-search-card">

          <div>

            <span className="ai-badge">
              ✦ AI POWERED
            </span>

            <h2>
              What service do you need?
            </h2>

            <p>
              Describe what you need in your own words and
              SkillSphere will find suitable professionals.
            </p>

          </div>

          <div className="ai-search-box">

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAISearch();
                }
              }}
              placeholder="e.g. I need someone to repair my leaking tap..."
            />

            <button
              onClick={handleAISearch}
              disabled={searching}
            >
              {searching
                ? "Finding..."
                : "Find a Professional ✦"}
            </button>

          </div>

          {/* ===============================
              AI Result
          =============================== */}
          {searchResult && (
            <div className="ai-result">

              <span>
                ✨ Suggested Skill
              </span>

              <strong>
                {searchResult}
              </strong>

            </div>
          )}
          
          {/* ===============================
                Nearby Providers Map
              ================================ */}

            <ProviderMap providers={providers} />


          {/* ===============================
              Provider Results
          =============================== */}
          {providers.length > 0 && (
            <div className="provider-results">

              <div className="provider-results-header">
                <h2>
                  Recommended Professionals
                </h2>

                <span>
                  {providers.length} found
                </span>
              </div>

              <div className="provider-list">

                {providers.map((provider) => (

                  <div
                    className="provider-card"
                    key={provider._id}
                  >

                    {/* Provider Avatar */}
                    <div className="provider-avatar">
                      {provider.user?.fullName
                        ? provider.user.fullName
                            .charAt(0)
                            .toUpperCase()
                        : "P"}
                    </div>

                    {/* Provider Information */}
                    <div className="provider-info">

                      <h3>
                        {provider.user?.fullName ||
                          "Service Provider"}
                      </h3>

                      <p className="provider-skill">
                        🛠️ {provider.skills.join(", ")}
                      </p>

                      <p>
                        💼 {provider.experience} years experience
                      </p>

                      <p>
                        📍 {provider.location || "Location not specified"}
                      </p>

                      <p>
                        ⭐ {provider.rating || "New"} 
                      </p>

                    </div>

                    {/* Provider Price + Action */}
                    <div className="provider-action">

                      <strong>
                        ₹{provider.price}
                      </strong>

                      <span>
                        Starting price
                      </span>

                      <button
  onClick={() =>
    navigate("/provider-profile", {
      state: {
        provider: provider,
      },
    })
  }
>
  View Profile
</button>
                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* No Providers */}
          {searchResult && !searching && providers.length === 0 && (
            <div className="no-providers">

              <p>
                No available professionals found for{" "}
                <strong>{searchResult}</strong>.
              </p>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;