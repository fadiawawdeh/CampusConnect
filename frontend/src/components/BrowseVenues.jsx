import React, { useEffect, useState } from "react";
import "./BrowseVenues.css";

function BrowseVenues() {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/venues", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message = data?.message || "Unable to load venues.";
          throw new Error(message);
        }

        setVenues(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || "Unable to load venues.");
        setVenues([]);
      });
  }, []);



  return (
  <div className="browse-container">
    <h1 className="browse-title center">Browse Venues</h1>

    {error ? <p>{error}</p> : null}

    <div className="venue-grid">
      {venues.map((v) => {
        const isAvailable = true; // later connect to real data

        return (
          <div key={v.id} className="venue-card">

            {/* Title */}
            <h3 className="venue-card-title">{v.name}</h3>

            {/* Info */}
            <p><strong>Location:</strong> {v.location}</p>
            <p><strong>Capacity:</strong> {v.capacity}</p>

            {/* Status */}
            <p>
              <strong>Status:</strong>{" "}
              <span className={isAvailable ? "status-available" : "status-booked"}>
                {isAvailable ? "Available" : "Booked"}
              </span>
            </p>

            {/* Button */}
           <button
                 className="view-btn"
                 onClick={() => window.location.href = `/reserve/${v.id}`}
         >
                 View Availability
          </button>

          </div>
        );
      })}
    </div>
  </div>
);
}

export default BrowseVenues;
