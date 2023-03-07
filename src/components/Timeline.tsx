import React from "react";
import { FCFS } from "../lib/schedulers/FCFS";
import { TickGenerator } from "../lib/TickGenerator";
import { TimelineControls } from "./TimelineControls";
import { TimelineTrack } from "./TimelineTrack";

export const Timeline = () => {
  const scheduler = React.useMemo(() => new FCFS(), []);
  const generator = React.useMemo(() => new TickGenerator(), []);
  const [time, setTime] = React.useState(generator.time);
  React.useEffect(() => {
    generator.addTickListener(() => {
      setTime(generator.time);
    });
  }, []);
  return (
    <div>
      <div>time: {time}</div>
      <TimelineControls
        onPause={() => generator.stop()}
        onPlay={() => generator.start()}
        onProcessAdd={() => {
          scheduler.addProcess({
            arrival_time: 0,
            execution_time: Math.floor(Math.random() * 20 + 1),
            pid: Math.floor(Math.random() * 1000),
          });
        }}
      />
      <TimelineTrack scheduler={scheduler} />
    </div>
  );
};
