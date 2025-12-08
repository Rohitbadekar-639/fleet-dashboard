function MetricCard({ label, value, accent }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: accent || "#fff" }}>
        {value}
      </div>
    </div>
  );
}

function FleetSummary({ summary }) {
  const {
    total,
    completed,
    cancelled,
    inProgress,
    withAlerts,
    over50,
    over80,
    totalDistance,
  } = summary;

  return (
    <div className="fleet-summary">
      <MetricCard label="Total trips" value={total} />
      <MetricCard label="In progress" value={inProgress} />
      <MetricCard label="Completed" value={completed} />
      <MetricCard label="Cancelled" value={cancelled} />
      <MetricCard label="Trips with alerts" value={withAlerts} />
      <MetricCard label="≥ 50% complete" value={over50} />
      <MetricCard label="≥ 80% complete" value={over80} />
      <MetricCard label="Total distance (km)" value={totalDistance} />
    </div>
  );
}

export default FleetSummary;
