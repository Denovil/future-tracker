import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./components/FeatureCard";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import StatsBar from "./components/StatsBar";
import { API_URL } from "./utils/api";
import { getPriceValue } from "./utils/marketplace";
import { normalizeStatus } from "./utils/constants";
import "./styles/marketplace.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Listings" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const PRICE_BANDS = [
  { value: "all", label: "All prices" },
  { value: "under-5k", label: "Under TZS 5,000" },
  { value: "5k-20k", label: "TZS 5,000 - 20,000" },
  { value: "over-20k", label: "Above TZS 20,000" },
];

const matchesPriceBand = (feature, band) => {
  if (band === "all") return true;
  const price = getPriceValue(feature);
  if (price == null) return false;
  if (band === "under-5k") return price < 5000;
  if (band === "5k-20k") return price >= 5000 && price <= 20000;
  if (band === "over-20k") return price > 20000;
  return true;
};

const sortListings = (items, sortBy) => {
  const sorted = [...items];

  if (sortBy === "name") {
    sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return sorted;
  }

  if (sortBy === "price-low") {
    sorted.sort((a, b) => {
      const aPrice = getPriceValue(a);
      const bPrice = getPriceValue(b);
      if (aPrice == null && bPrice == null) return 0;
      if (aPrice == null) return 1;
      if (bPrice == null) return -1;
      return aPrice - bPrice;
    });
    return sorted;
  }

  if (sortBy === "price-high") {
    sorted.sort((a, b) => {
      const aPrice = getPriceValue(a);
      const bPrice = getPriceValue(b);
      if (aPrice == null && bPrice == null) return 0;
      if (aPrice == null) return 1;
      if (bPrice == null) return -1;
      return bPrice - aPrice;
    });
    return sorted;
  }

  sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return sorted;
};

export default function FeatureTrackerApp({ features: propsFeatures, loading: propsLoading }) {
  const navigate = useNavigate();
  const [features, setFeatures] = useState(propsFeatures || []);
  const [loading, setLoading] = useState(propsLoading !== undefined ? propsLoading : true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priceBand, setPriceBand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (propsFeatures) {
      setFeatures(propsFeatures);
      setLoading(false);
      return;
    }

    const fetchFeatures = () => {
      setLoading(true);
      setError(null);
      axios
        .get(API_URL)
        .then((res) => setFeatures(res.data))
        .catch(() => setError("Failed to load listings. Please try again."))
        .finally(() => setLoading(false));
    };

    fetchFeatures();
  }, [propsFeatures]);

  const counts = useMemo(
    () => ({
      Available: features.filter((f) => normalizeStatus(f.status) === "Available").length,
      "In Progress": features.filter((f) => f.status === "In Progress").length,
      Completed: features.filter((f) => f.status === "Completed").length,
    }),
    [features]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const byFilters = features.filter((feature) => {
      if (statusFilter !== "All" && normalizeStatus(feature.status) !== statusFilter) return false;
      if (!matchesPriceBand(feature, priceBand)) return false;

      if (!query) return true;

      const searchable = [
        feature.title,
        feature.description,
        feature.location,
        feature.sellerName,
        feature.seller,
        feature.brand,
        feature.condition,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });

    return sortListings(byFilters, sortBy);
  }, [features, priceBand, searchQuery, sortBy, statusFilter]);

  const handleViewDetails = (feature) => {
    navigate(`/feature/${feature.id}`);
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setPriceBand("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="marketplace-page">
      <header className="marketplace-header">
        <div className="marketplace-brand">
          <span className="marketplace-kicker">Auto Spare Parts Marketplace</span>
          <h1>Future Spares</h1>
          <p>Find trusted parts by name, price, and listing status.</p>
        </div>
        <div className="marketplace-search-wrap">
          <input
            type="search"
            className="marketplace-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by part name, brand, or description"
            aria-label="Search listings"
          />
        </div>
      </header>

      <StatsBar features={features} />

      <div className="marketplace-toolbar">
        <FilterBar active={statusFilter} onChange={setStatusFilter} counts={counts} />
        <label className="marketplace-sort-field">
          <span>Sort:</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="marketplace-layout">
        <aside className="marketplace-sidebar">
          <section className="marketplace-sidebar-card">
            <h3>Price Range</h3>
            <div className="marketplace-price-list">
              {PRICE_BANDS.map((band) => (
                <button
                  type="button"
                  key={band.value}
                  className={`marketplace-price-item ${priceBand === band.value ? "active" : ""}`}
                  onClick={() => setPriceBand(band.value)}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </section>

          <button type="button" className="marketplace-reset" onClick={resetFilters}>
            Reset filters
          </button>
        </aside>

        <section className="marketplace-results">
          <div className="marketplace-results-header">
            <p>
              Showing <strong>{filtered.length}</strong> listing{filtered.length === 1 ? "" : "s"}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="marketplace-clear-search"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>

          {loading && (
            <div className="marketplace-message" role="status">
              Loading listings...
            </div>
          )}

          {error && (
            <div className="marketplace-message marketplace-error" role="alert">
              <p>{error}</p>
              <button type="button" className="marketplace-retry" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <EmptyState filter={statusFilter} searchQuery={searchQuery} onReset={resetFilters} />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="marketplace-grid">
              {filtered.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} onViewDetails={handleViewDetails} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
