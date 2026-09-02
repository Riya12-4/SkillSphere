import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";

import "leaflet/dist/leaflet.css";

// ===============================
// Fix Leaflet Marker Icons
// ===============================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ===============================
// Map Center Component
// ===============================
function MapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);

  return null;
}

// ===============================
// Provider Map
// ===============================
function ProviderMap() {
  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [providers, setProviders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ===============================
  // Get Customer Current Location
  // ===============================
  useEffect(() => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      setLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const location = [
          latitude,
          longitude,
        ];

        setCustomerLocation(location);

        try {
          const token = localStorage.getItem("token");

if (!token) {
  setError("Please login to find nearby professionals.");
  setLoading(false);
  return;
}

const response = await axios.get(
  "https://skillsphere-backend-58ha.onrender.com/api/providers/nearby",
  {
    params: {
      latitude,
      longitude,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

          if (response.data.success) {
            setProviders(
              response.data.providers || []
            );
          } else {
            setProviders([]);
          }
        } catch (apiError) {
          console.error(
            "Nearby Providers Error:",
            apiError
          );

          setError(
            apiError.response?.data?.message ||
              "Unable to find nearby providers."
          );
        } finally {
          setLoading(false);
        }
      },

      (locationError) => {
        console.error(
          "Customer Location Error:",
          locationError
        );

        setError(
          "Please allow location access to find nearby professionals."
        );

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div className="provider-map-section">

        <div className="provider-map-header">
          <div>
            <span className="map-badge">
              📍 LOCATION
            </span>

            <h2>Nearby Professionals</h2>

            <p>
              Finding professionals near you...
            </p>
          </div>
        </div>

        <div className="map-loading">
          <div className="map-loading-icon">
            📍
          </div>

          <p>
            Detecting your location...
          </p>
        </div>

      </div>
    );
  }

  // ===============================
  // Location Error
  // ===============================
  if (error || !customerLocation) {
    return (
      <div className="provider-map-section">

        <div className="provider-map-header">
          <div>
            <span className="map-badge">
              📍 LOCATION
            </span>

            <h2>Nearby Professionals</h2>

            <p>
              Find skilled professionals around
              your location.
            </p>
          </div>
        </div>

        <div className="map-error">

          <div className="map-error-icon">
            ⚠️
          </div>

          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="provider-map-section">

      {/* ===============================
          Header
      =============================== */}

      <div className="provider-map-header">

        <div>

          <span className="map-badge">
            📍 NEARBY
          </span>

          <h2>
            Professionals Near You
          </h2>

          <p>
            Available service providers around
            your current location.
          </p>

        </div>

        <div className="provider-count">
          {providers.length} found
        </div>

      </div>

      {/* ===============================
          Map
      =============================== */}

      <div className="provider-map">

        <MapContainer
          center={customerLocation}
          zoom={12}
          scrollWheelZoom={true}
          style={{
            height: "450px",
            width: "100%",
          }}
        >

          <MapCenter
            position={customerLocation}
          />

          {/* OpenStreetMap */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ===============================
              Customer Location
          =============================== */}

          <Marker position={customerLocation}>

            <Popup>

              <div className="map-popup">

                <h3>
                  📍 You are here
                </h3>

                <p>
                  Your current location
                </p>

              </div>

            </Popup>

          </Marker>

          {/* Customer search radius */}
          <Circle
            center={customerLocation}
            radius={5000}
            pathOptions={{
              fillOpacity: 0.08,
            }}
          />

          {/* ===============================
              Provider Markers
          =============================== */}

          {providers.map((provider) => {

            const latitude =
              Number(provider.latitude);

            const longitude =
              Number(provider.longitude);

            if (
              Number.isNaN(latitude) ||
              Number.isNaN(longitude)
            ) {
              return null;
            }

            return (
              <Marker
                key={provider._id}
                position={[
                  latitude,
                  longitude,
                ]}
              >

                <Popup>

                  <div className="map-popup">

                    <h3>
                      {provider.user?.fullName ||
                        "Service Provider"}
                    </h3>

                    <p>
                      🛠️{" "}
                      {provider.skills?.join(
                        ", "
                      ) ||
                        "Professional Service"}
                    </p>

                    <p>
                      📍{" "}
                      {provider.location ||
                        "Location not specified"}
                    </p>

                    <p>
                      ⭐{" "}
                      {provider.rating || "New"}
                    </p>

                    <p>
                      💰 ₹
                      {provider.price || 0}
                    </p>

                    <p>
                      📏{" "}
                      {provider.distance ?? "--"}{" "}
                      km away
                    </p>

                    <button
                      onClick={() => {
                        window.location.href =
                          `/provider-profile`;
                      }}
                    >
                      View Profile
                    </button>

                  </div>

                </Popup>

              </Marker>
            );
          })}

        </MapContainer>

      </div>

      {/* ===============================
          Provider List Under Map
      =============================== */}

      {providers.length > 0 ? (

        <div className="nearby-provider-list">

          {providers.map((provider) => (

            <div
              className="nearby-provider-item"
              key={provider._id}
            >

              <div className="nearby-provider-avatar">
                {provider.user?.fullName
                  ? provider.user.fullName
                      .charAt(0)
                      .toUpperCase()
                  : "P"}
              </div>

              <div className="nearby-provider-info">

                <h3>
                  {provider.user?.fullName ||
                    "Service Provider"}
                </h3>

                <p>
                  🛠️{" "}
                  {provider.skills?.join(
                    ", "
                  )}
                </p>

                <span>
                  📏 {provider.distance} km away
                </span>

              </div>

              <div className="nearby-provider-price">

                <strong>
                  ₹{provider.price}
                </strong>

                <small>
                  Starting price
                </small>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="map-empty">

          <span>📍</span>

          <p>
            No available professionals found
            near your location.
          </p>

        </div>

      )}

    </div>
  );
}

export default ProviderMap;