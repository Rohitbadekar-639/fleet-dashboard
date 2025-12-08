function PlaybackControls({
  isPlaying,
  onPlayPause,
  speed,
  setSpeed,
  canReset,
  onReset,
  simTimeLabel,
}) {
  return (
    <div className="controls">
      <div className="controls-left">
        <button onClick={onPlayPause} className="btn primary">
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={onReset}
          className="btn"
          disabled={!canReset}
          style={{ marginLeft: "0.5rem" }}
        >
          Reset
        </button>

        <span className="sim-time-label">
          Simulation time: <span className="mono">{simTimeLabel}</span>
        </span>
      </div>

      <div className="controls-right">
        <span>Speed:</span>
        {[1, 5, 10].map((value) => (
          <button
            key={value}
            className={
              "btn small" + (speed === value ? " primary" : " ghost")
            }
            onClick={() => setSpeed(value)}
          >
            {value}x
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlaybackControls;
