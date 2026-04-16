import React, { useState } from 'react';

export default function EquipmentForm({ reservationId }) {
  const [projector, setProjector] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [extraChairs, setExtraChairs] = useState(false);
  const [chairsCount, setChairsCount] = useState(0);

  // This function sends your data to the Backend API we just built!
  const saveEquipment = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming the user token saves in localStorage from the Login task
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          reservation_id: reservationId, // Your teammate will pass this to you!
          projector: projector,
          microphone: microphone,
          extra_chairs_count: extraChairs ? chairsCount : 0
        })
      });

      if (response.ok) {
        alert("Equipment requested successfully!");
      } else {
        alert("Failed to request equipment.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginTop: "20px" }}>
      <h3>Request Event Equipment</h3>
      
      <form onSubmit={saveEquipment}>
        {/* Projector Checkbox */}
        <div>
          <label>
            <input type="checkbox" checked={projector} onChange={(e) => setProjector(e.target.checked)} />
            Projector
          </label>
        </div>

        {/* Microphone Checkbox */}
        <div>
          <label>
            <input type="checkbox" checked={microphone} onChange={(e) => setMicrophone(e.target.checked)} />
            Microphone
          </label>
        </div>

        {/* Extra Chairs Checkbox */}
        <div>
          <label>
            <input type="checkbox" checked={extraChairs} onChange={(e) => setExtraChairs(e.target.checked)} />
            Extra Chairs
          </label>
        </div>

        {/* Number of Chairs (Only shows if Extra Chairs is checked!) */}
        {extraChairs && (
          <div style={{ marginTop: "10px" }}>
            <label>
              How many chairs?
              <input 
                type="number" 
                min="1" 
                value={chairsCount} 
                onChange={(e) => setChairsCount(parseInt(e.target.value))} 
                style={{ marginLeft: "10px" }}
              />
            </label>
          </div>
        )}

        <button type="submit" style={{ marginTop: "15px", padding: "5px 15px" }}>
          Save Equipment
        </button>
      </form>
    </div>
  );
}
