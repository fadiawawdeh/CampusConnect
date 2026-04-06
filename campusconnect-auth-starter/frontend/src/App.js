import React from "react";
import BrowseVenues from "./components/BrowseVenues";
import CreateReservation from "./components/CreateReservation";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Campus Connect</h1>

      <BrowseVenues />

      <hr />

      <CreateReservation />
    </div>
  );
}

export default App;
