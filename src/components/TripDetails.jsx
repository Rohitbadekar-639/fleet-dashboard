function TripDetails({ trip }) {
  if (!trip) {
    return (
      <div className="trip-details">
        <h2>Trip details</h2>
        <div className="empty-state">
          Select a trip from the left panel to see details.
        </div>
      </div>
    );
  }

  return (
    <div className="trip-details">
      <h2>Trip details</h2>

      <div className="trip-details-grid">
        <div>
          <div className="label">Trip ID</div>
          <div className="value mono">{trip.tripId}</div>
        </div>

        <div>
          <div className="label">Status</div>
          <div className="value">{trip.status}</div>
        </div>

        <div>
          <div className="label">Completion</div>
          <div className="value">{trip.completionPct || 0}%</div>
        </div>

        <div>
          <div className="label">Distance (km)</div>
          <div className="value">{trip.distanceKm.toFixed(1)}</div>
        </div>

        {trip.fuelLevel != null && (
          <div>
            <div className="label">Fuel level</div>
            <div className="value">{trip.fuelLevel.toFixed(1)}%</div>
          </div>
        )}

        {trip.currentLocation && (
          <div>
            <div className="label">Last location</div>
            <div className="value mono">
              {trip.currentLocation.lat.toFixed(4)},{" "}
              {trip.currentLocation.lng.toFixed(4)}
            </div>
          </div>
        )}

        <div>
          <div className="label">Events processed</div>
          <div className="value">{trip.totalEvents}</div>
        </div>
      </div>

      <div className="alerts-section">
        <div className="label">Active alerts</div>
        {trip.alerts.length === 0 ? (
          <div className="empty-state small">No active alerts</div>
        ) : (
          <ul className="alerts-list">
            {trip.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TripDetails;
