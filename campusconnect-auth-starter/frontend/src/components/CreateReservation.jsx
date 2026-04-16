import React, { useState, useEffect } from "react";
import "./CreateReservation.css";
import { useParams } from "react-router-dom";
function CreateReservation() {
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [time, setTime] = useState("");
  const { id } = useParams();
  useEffect(() => {
  fetch("http://localhost:5000/api/venues")
    .then(res => res.json())
    .then(data => {
      setVenues(data);
      if (id) setVenueId(id);
    });
}, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const reservation = {
      venueId,
      date,
      purpose
    };

    console.log("Reservation Data:", reservation);

    alert("Reservation submitted! (mock)");
  };

  return (
  <div className="reservation-container">
    <div className="reservation-card">

      <h2 className="reservation-title center">
        Create Reservation
      </h2>

      <form className="reservation-form" onSubmit={handleSubmit}>

        
        <label>Select Venue</label>
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          required
        >
          <option value="">-- Choose Venue --</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        
        <label>Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        
        <label>Select Time</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        >
          <option value="">-- Choose Time --</option>
          <option>09:00</option>
          <option>10:00</option>
          <option>11:00</option>
          <option>12:00</option>
        </select>

        
        <label>Purpose</label>
        <input
          type="text"
          placeholder="Study / Meeting..."
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />

        <button className="reservation-btn">
          Confirm Reservation
        </button>

      </form>
    </div>
  </div>
);
}

export default CreateReservation;