import React from "react";

export const TimelinePlayhead = ({ time, setTime, isRunning, totalTime }: TimelinePlayheadProps) => {
  return (
    <div className={`timeline-playhead ${isRunning ? "" : ""}`}>
      <input
        type="range"
        min={0}
        max={totalTime}
        value={time}
        onChange={(e) => setTime(+e.target.value)}
        className={"timeline-playhead-slider"}
        style={{ width: totalTime * 50 }}
      />
      {/* <div className="timeline-playhead-needle" style={{ marginLeft: offset }}>
        <div
          className="timeline-playhead-needle-draggable"

        ></div>
      </div> */}
    </div>
  );
};

export interface TimelinePlayheadProps {
  time: number;
  setTime: (time: number) => void;
  isRunning: boolean;
  totalTime: number;
}
