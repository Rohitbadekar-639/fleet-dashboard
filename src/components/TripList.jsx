function statusColor(status) {
  switch (status) {
    case "completed":
      return "#22c55e"; // green
    case "cancelled":
      return "#f97373"; // red
    case "in_progress":
      return "#38bdf8"; // blue
    default:
      return "#a1a1aa"; // gray
  }
}

function TripList({ trips, selectedTripId, onSelectTrip }) {
  return (
    <div className="trip-list">
      <div className="trip-list-header">
        <h2>Trips</h2>
        <span className="muted">
          {trips.length ? `${trips.length} active trips` : "No trips yet"}
        </span>
      </div>

      <div className="trip-list-body">
        {trips.map((trip) => {
          const isSelected = trip.tripId === selectedTripId;
          return (
            <button
              key={trip.tripId}
              className={
                "trip-row" + (isSelected ? " trip-row-selected" : "")
              }
              onClick={() => onSelectTrip(trip.tripId)}
            >
              <div className="trip-row-main">
                <div className="trip-row-title">
                  <span className="badge" style={{ background: statusColor(trip.status) }} />
                  <span className="trip-id">{trip.tripId}</span>
                </div>
                <div className="trip-row-status">
                  <span className="status-text" style={{ color: statusColor(trip.status) }}>
                    {trip.status}
                  </span>
                  <span className="completion">
                    {trip.completionPct || 0}% complete
                  </span>
                </div>
              </div>

              <div className="trip-row-meta">
                <span>Distance: {trip.distanceKm.toFixed(1)} km</span>
                {trip.fuelLevel != null && (
                  <span>Fuel: {trip.fuelLevel.toFixed(1)}%</span>
                )}
                {trip.alerts.length > 0 && (
                  <span className="alerts-chip">
                    {trip.alerts.length} alert
                    {trip.alerts.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {trips.length === 0 && (
          <div className="empty-state">
            Waiting for events… start the simulation.
          </div>
        )}
      </div>
    </div>
  );
}

export default TripList;
