// src/App.jsx — Router Setup
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import FeatureTrackerApp from "./FeatureTrackerApp";
import FeatureDetailsPage from "./pages/FeatureDetailsPage";
import AdminDashboard from "./admin/AdminDashboard";
import { API_URL } from "./utils/api";
const MOCK_TITLES = new Set([
  "Dark mode support",
  "Export to CSV",
  "Email notifications",
  "Mobile app support",
  "Advanced search filters",
]);

export default function App() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadFeatures = () => {
    setLoading(true);
    return axios.get(API_URL, { params: { _ts: Date.now() } })
      .then(res => setFeatures(res.data.filter((feature) => !MOCK_TITLES.has(feature.title))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeatures();
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<FeatureTrackerApp features={features} loading={loading} />} />
      <Route path="/feature/:id" element={<FeatureDetailsPage features={features} />} />
      <Route path="/admin" element={<AdminDashboard onFeaturesChanged={loadFeatures} />} />
    </Routes>
  );
}
