import React from "react";
import { Scheduler } from "../lib/Scheduler";
import "./Timeline.css";

const TimelineBlock = ({ width }: { width: number }) => {
  const w = width * 50 - 10;
  return (
    <div className="timeline-block" style={{ width: w, minWidth: w }}>
      <div className="timeline-block-content">"dupa"</div>
    </div>
  );
};

export const TimelineTrack = ({ scheduler }: { scheduler: Scheduler }) => {
  return (
    <div className="timeline-track">
      {scheduler.getProcessShards().map((shard) => (
        <TimelineBlock width={shard.shard_time} />
      ))}
    </div>
  );
};
