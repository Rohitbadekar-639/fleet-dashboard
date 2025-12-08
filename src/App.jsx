import { useEffect, useState, useMemo } from "react";

import trip1 from "./data/trip_1_cross_country.json";
import trip2 from "./data/trip_2_urban_dense.json";
import trip3 from "./data/trip_3_mountain_cancelled.json";
import trip4 from "./data/trip_4_southern_technical.json";
import trip5 from "./data/trip_5_regional_logistics.json";

import Header from "./components/Header.jsx";
import PlaybackControls from "./components/PlaybackControls.jsx";
import FleetSummary from "./components/FleetSummary.jsx";
import TripList from "./components/TripList.jsx";
import TripDetails from "./components/TripDetails.jsx";
import FleetMap from "./components/FleetMap.jsx";

// --------- Helpers for simulation ---------

function createEmptyTripState(tripId) {
  return {
    tripId,
    status: "not_started", // not_started | in_progress | completed | cancelled
    currentLocation: null,
    lastTimestamp: null,
    distanceKm: 0,
    plannedDistanceKm: null,
    completionPct: 0,
    fuelLevel: null,
    alerts: [],
    totalEvents: 0,
  };
}

function addAlert(trip, label) {
  if (!trip.alerts.includes(label)) {
    trip.alerts.push(label);
  }
}

function removeAlert(trip, label) {
  trip.alerts = trip.alerts.filter((a) => a !== label);
}

// Apply one event to one trip state
function applyEventToTrip(trip, ev) {
  trip.totalEvents += 1;
  const ts = new Date(ev.timestamp).getTime();
  trip.lastTimestamp = ts;

  // Location updates
  if (ev.location && typeof ev.location.lat === "number" && typeof ev.location.lng === "number") {
    trip.currentLocation = {
      lat: ev.location.lat,
      lng: ev.location.lng,
    };
  }

  // Distance
  if (typeof ev.distance_travelled_km === "number") {
    trip.distanceKm = ev.distance_travelled_km;
  }

  // Fuel from telemetry or fuel events
  if (ev.event_type === "vehicle_telemetry" && ev.telemetry) {
    if (typeof ev.telemetry.fuel_level_percent === "number") {
      trip.fuelLevel = ev.telemetry.fuel_level_percent;
    }
  }

  if (ev.event_type === "fuel_level_low") {
    if (typeof ev.fuel_level_percent === "number") {
      trip.fuelLevel = ev.fuel_level_percent;
    }
    addAlert(trip, "Fuel low");
  }

  if (ev.event_type === "refueling_completed") {
    if (typeof ev.fuel_level_after_refuel === "number") {
      trip.fuelLevel = ev.fuel_level_after_refuel;
    }
    removeAlert(trip, "Fuel low");
  }

  // Trip lifecycle
  if (ev.event_type === "trip_started") {
    trip.status = "in_progress";
    if (typeof ev.planned_distance_km === "number") {
      trip.plannedDistanceKm = ev.planned_distance_km;
    }
  }

  if (ev.event_type === "trip_completed") {
    trip.status = "completed";
    if (typeof ev.total_distance_km === "number") {
      trip.distanceKm = ev.total_distance_km;
    }
    trip.completionPct = 100;
  }

  if (ev.event_type === "trip_cancelled") {
    trip.status = "cancelled";
    if (typeof ev.distance_completed_km === "number") {
      trip.distanceKm = ev.distance_completed_km;
    }
  }

  // Status/alerts based on other events
  if (ev.event_type === "vehicle_stopped") {
    addAlert(trip, "Stopped");
  }

  if (ev.event_type === "vehicle_moving") {
    removeAlert(trip, "Stopped");
  }

  if (ev.event_type === "speed_violation") {
    addAlert(trip, "Overspeed");
  }

  if (ev.event_type === "signal_lost") {
    addAlert(trip, "Signal lost");
  }

  if (ev.event_type === "signal_recovered") {
    removeAlert(trip, "Signal lost");
  }

  if (ev.event_type === "battery_low") {
    addAlert(trip, "Device battery low");
  }

  if (ev.event_type === "device_error") {
    addAlert(trip, "Device error");
  }

  // Compute completion % if we know planned distance
  if (trip.plannedDistanceKm && trip.plannedDistanceKm > 0) {
    const pct = (trip.distanceKm / trip.plannedDistanceKm) * 100;
    trip.completionPct = Math.max(0, Math.min(100, Math.round(pct)));
  }
}

function formatTime(tsMs) {
  if (!tsMs) return "-";
  const d = new Date(tsMs);
  return d.toLocaleString();
}

function App() {
  const [allEvents, setAllEvents] = useState([]);
  const [simStart, setSimStart] = useState(null);
  const [simEnd, setSimEnd] = useState(null);
  const [simTime, setSimTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 5x, 10x

  const [pointer, setPointer] = useState(0); // index in allEvents
  const [trips, setTrips] = useState({});
  const [selectedTripId, setSelectedTripId] = useState(null);

  // 1) Load and prepare data once
  useEffect(() => {
    const combined = [...trip1, ...trip2, ...trip3, ...trip4, ...trip5];

    // Sort by timestamp
    combined.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    setAllEvents(combined);

    if (combined.length > 0) {
      const start = new Date(combined[0].timestamp).getTime();
      const end = new Date(
        combined[combined.length - 1].timestamp
      ).getTime();
      setSimStart(start);
      setSimEnd(end);
      setSimTime(start);
    }
  }, []);

  // 2) Timer: advance simulation time when playing
  useEffect(() => {
    if (!isPlaying || !simStart || !simEnd) return;

    const id = setInterval(() => {
      setSimTime((prev) => {
        if (prev === null) return prev;
        let next = prev + 1000 * speed; // advance 1 second * speed factor
        if (next > simEnd) {
          next = simEnd;
        }
        return next;
      });
    }, 500); // every 0.5 seconds

    return () => clearInterval(id);
  }, [isPlaying, speed, simStart, simEnd]);

  // 3) Consume events up to current simulation time
  useEffect(() => {
    if (!allEvents.length || simTime === null) return;
    if (pointer >= allEvents.length) return;

    let idx = pointer;
    const newTrips = { ...trips };

    while (
      idx < allEvents.length &&
      new Date(allEvents[idx].timestamp).getTime() <= simTime
    ) {
      const ev = allEvents[idx];
      const tripId = ev.trip_id;

      if (!newTrips[tripId]) {
        newTrips[tripId] = createEmptyTripState(tripId);
      }

      applyEventToTrip(newTrips[tripId], ev);

      idx++;
    }

    if (idx !== pointer) {
      setPointer(idx);
      setTrips(newTrips);

      if (!selectedTripId) {
        // auto-select first trip once data starts flowing
        const firstTripId = Object.keys(newTrips)[0];
        if (firstTripId) setSelectedTripId(firstTripId);
      }
    }
  }, [simTime, allEvents, pointer, trips, selectedTripId]);

  // 4) Derived data for summary
  const tripArray = useMemo(() => Object.values(trips), [trips]);

  const summary = useMemo(() => {
    const total = tripArray.length;
    const completed = tripArray.filter((t) => t.status === "completed").length;
    const cancelled = tripArray.filter((t) => t.status === "cancelled").length;
    const inProgress = tripArray.filter((t) => t.status === "in_progress")
      .length;
    const withAlerts = tripArray.filter((t) => t.alerts.length > 0).length;

    const over50 = tripArray.filter((t) => t.completionPct >= 50).length;
    const over80 = tripArray.filter((t) => t.completionPct >= 80).length;

    const totalDistance = tripArray.reduce(
      (sum, t) => sum + (t.distanceKm || 0),
      0
    );

    return {
      total,
      completed,
      cancelled,
      inProgress,
      withAlerts,
      over50,
      over80,
      totalDistance: totalDistance.toFixed(1),
    };
  }, [tripArray]);

  const selectedTrip =
    selectedTripId && trips[selectedTripId]
      ? trips[selectedTripId]
      : null;

  const handleReset = () => {
    if (!allEvents.length || simStart == null) return;
    setSimTime(simStart);
    setPointer(0);
    setTrips({});
    setSelectedTripId(null);
  };

  return (
    <div className="app-root">
      <Header />

      <div className="top-bar">
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((prev) => !prev)}
          speed={speed}
          setSpeed={setSpeed}
          canReset={!!allEvents.length}
          onReset={handleReset}
          simTimeLabel={formatTime(simTime)}
        />

        <FleetSummary summary={summary} />
      </div>

      <div className="main-layout">
        <div className="left-panel">
          <TripList
            trips={tripArray}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
          />
        </div>

        <div className="right-panel">
          <FleetMap
            trips={tripArray}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
          />

          <TripDetails trip={selectedTrip} />
        </div>
      </div>

      <footer className="footer">
        <span>Simulation window: </span>
        <span className="mono">
          {simStart ? formatTime(simStart) : "-"}
        </span>
        <span> → </span>
        <span className="mono">
          {simEnd ? formatTime(simEnd) : "-"}
        </span>
      </footer>
    </div>
  );
}

export default App;
