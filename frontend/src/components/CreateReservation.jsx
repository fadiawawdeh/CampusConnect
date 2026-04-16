import React, { useState, useEffect } from "react";
import "./CreateReservation.css";

function CreateReservation() {
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState("");
  const [date, setDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/venues")
      .then((res) => res.json())
      .then((data) => {
        setVenues(Array.isArray(data) ? data : []);
      })
      .catch(() => setVenues([]));
  }, []);

  const addOneHour = (timeValue) => {
    const [hours, minutes] = timeValue.split(":").map(Number);
    const nextHours = (hours + 1).toString().padStart(2, "0");
    return `${nextHours}:${minutes.toString().padStart(2, "0")}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please login first to create a reservation.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venueId: Number(venueId),
          eventName,
          reservationDate: date,
          startTime: `${startTime}:00`,
          endTime: addOneHour(startTime),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create reservation.");
      }

      setMessage("Reservation created successfully.");
      setVenueId("");
      setDate("");
      setEventName("");
      setStartTime("");
    } catch (error) {
      setMessage(error.message || "Failed to create reservation.");
    }
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
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        >
          <option value="">-- Choose Time --</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
        </select>

        
        <label>Event / Purpose</label>
        <input
          type="text"
          placeholder="Study / Meeting..."
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        />

        <button className="reservation-btn">
          Confirm Reservation
        </button>

      </form>
      {message ? <p>{message}</p> : null}
    </div>
  </div>
);
}

export default CreateReservation;