import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import Bookings from "./pages/Bookings";
import ProviderBookings from "./pages/ProviderBookings";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProviderProfileEdit from "./pages/ProviderProfileEdit";
import ProviderPortfolio from "./pages/ProviderPortfolio";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Customer Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Provider Dashboard */}
        <Route
          path="/provider-dashboard"
          element={<ProviderDashboard />}
        />

        {/* Provider Profile */}
        <Route
          path="/provider-profile"
          element={<ProviderProfile />}
        />

        <Route
          path="/provider-profile-edit"
          element={<ProviderProfileEdit />}
        />

        {/* Customer Bookings */}
        <Route
          path="/bookings"
          element={<Bookings />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />
        
        {/* Provider Bookings */}
        <Route
          path="/provider-bookings"
          element={<ProviderBookings />}
        />

        <Route
          path="/provider-portfolio"
          element={<ProviderPortfolio />}
        />

        <Route
          path="/admin-dashboard"
          element={
          <AdminProtectedRoute>
          <AdminDashboard />
          </AdminProtectedRoute>
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;