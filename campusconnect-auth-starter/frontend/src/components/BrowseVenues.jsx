import React, { useEffect, useState } from "react";
import "./BrowseVenues.css";

function BrowseVenues() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // fake time slots (for sprint 1)
  const timeSlots = [
    "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00"
  ];

  // fake booked slots (simulate DB)
  const bookedSlots = ["10:00", "13:00"];

  useEffect(() => {
    fetch("http://localhost:5000/api/venues")
      .then(res => res.json())
      .then(data => setVenues(data));
  }, []);

  

  return (
  <div className="browse-container">
    <h1 className="browse-title center">Browse Venues</h1>

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