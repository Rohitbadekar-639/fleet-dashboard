import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet's default icon paths in bundlers like Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function statusColor(status) {
  switch (status) {
    case "completed":
      return "#22c55e";
    case "cancelled":
      return "#f97373";
    case "in_progress":
      return "#38bdf8";
    default:
      return "#a1a1aa";
  }
}

function FleetMap({ trips, selectedTripId, onSelectTrip }) {
  // Center map roughly over the US
  const center = [39.5, -98.35];

  return (
    <div className="fleet-map">
      <h2>Fleet map</h2>
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "260px", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trips
          .filter((t) => t.currentLocation)
          .map((trip) => (
            <Marker
              key={trip.tripId}
              position={[
                trip.currentLocation.lat,
                trip.currentLocation.lng,
              ]}
              eventHandlers={{
                click: () => onSelectTrip(trip.tripId),
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: statusColor(trip.status),
                    }}
                  >
                    {trip.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <div>
                      <strong>Trip:</strong> {trip.tripId}
                    </div>
                    <div>
                      <strong>Distance:</strong> {trip.distanceKm.toFixed(1)}{" "}
                      km
                    </div>
                    {trip.fuelLevel != null && (
                      <div>
                        <strong>Fuel:</strong> {trip.fuelLevel.toFixed(1)}%
                      </div>
                    )}
                    {trip.alerts.length > 0 && (
                      <div style={{ marginTop: 4, color: "#f97373" }}>
                        {trip.alerts.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default FleetMap;
