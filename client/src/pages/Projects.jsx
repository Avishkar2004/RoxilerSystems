import React, { useEffect, useState } from "react";
import api from "../config/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function RatingSelector({ value, onChange }) {
  const handleClick = (val) => {
    onChange(val);
  };

  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((val) => {
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border text-xs " +
              (active
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-blue-400")
            }
            onClick={() => handleClick(val)}
          >
            {val}
          </button>
        );
      })}
    </div>
  );
}

function Projects() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [ratingsDraft, setRatingsDraft] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");

  const fetchStores = async (search) => {
    setLoading(true);
    setError("");
    setRatingError("");
    setRatingSuccess("");
    try {
      const params = {};
      if (search) {
        params.search = search;
      }
      const { data } = await api.get("/stores", { params });
      setStores(data);
      const initial = {};
      data.forEach((s) => {
        initial[s.id] = s.userRating ? Number(s.userRating) : 0;
      });
      setRatingsDraft(initial);
    } catch (err) {
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const combined = `${filters.name} ${filters.address}`.trim();
    fetchStores(combined || undefined);
  };

  const handleRatingChange = (storeId, rating) => {
    setRatingsDraft({ ...ratingsDraft, [storeId]: rating });
  };

  const handleSubmitRating = async (storeId) => {
    const rating = ratingsDraft[storeId];
    if (!rating || rating < 1 || rating > 5) {
      setRatingError("Rating must be between 1 and 5.");
      setRatingSuccess("");
      return;
    }
    setSubmittingId(storeId);
    try {
      await api.post("/ratings", { storeId, rating });
      setRatingError("");
      setRatingSuccess("Rating saved successfully.");
      await fetchStores(); // refresh ratings and averages
    } catch (err) {
      setRatingSuccess("");
      setRatingError(
        err.response?.data?.message ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-50">Stores</h2>
        <p className="mt-1 text-sm text-slate-300">
          Browse all registered stores, search by name or address, and submit your
          ratings.
        </p>
        <form
          onSubmit={handleSearch}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1">
            <Input
              label="Store Name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Address"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
            />
          </div>
          <div className="self-end">
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        {loading && <div className="text-sm text-slate-300">Loading stores...</div>}
        {error && <div className="text-xs text-red-400">{error}</div>}
        {ratingError && !error && (
          <div className="mt-1 text-xs text-red-400">{ratingError}</div>
        )}
        {ratingSuccess && !error && !ratingError && (
          <div className="mt-1 text-xs text-emerald-400">{ratingSuccess}</div>
        )}
        {!loading && !error && stores.length === 0 && (
          <div className="text-sm text-slate-300">No stores found.</div>
        )}
        {!loading && stores.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm text-slate-100">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/80">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Overall Rating
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Your Rating
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-slate-800">
                    <td className="px-3 py-2">{store.name}</td>
                    <td className="px-3 py-2">{store.address}</td>
                    <td className="px-3 py-2">
                      {Number(store.averageRating).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <RatingSelector
                        value={ratingsDraft[store.id] || 0}
                        onChange={(val) => handleRatingChange(store.id, val)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleSubmitRating(store.id)}
                        disabled={submittingId === store.id}
                      >
                        {submittingId === store.id ? "Saving..." : "Save Rating"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Projects;

