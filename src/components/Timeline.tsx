import React from "react";
import { FCFS } from "../lib/schedulers/FCFS";
import { TimelineControls } from "./TimelineControls";

export const Timeline = () => {
  const [scheduler, setScheduler] = React.useState(new FCFS());
  return (
    <div>
      <TimelineControls onPause={() => null} onPlay={() => null} />
    </div>
  );
};
