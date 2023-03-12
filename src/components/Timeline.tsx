import React from "react";
import { generateProcess, getTotalExecutionTime } from "../lib/ProcessGenerator";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import { FCFS } from "../lib/schedulers/FCFS";
import { SJF } from "../lib/schedulers/SJF";
import { TickGenerator } from "../lib/TickGenerator";
import { TimelineControls } from "./TimelineControls";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { TimelineTrack } from "./TimelineTrack";

interface SchedulerData {
  scheduler: Scheduler;
  currentQueue: ProcessShard[];
}

export const Timeline = () => {
  const [schedulers, setScheduelers] = React.useState<SchedulerData[]>([
    { currentQueue: [], scheduler: new FCFS() },
    { currentQueue: [], scheduler: new SJF({ preemptive: false }) },
    { currentQueue: [], scheduler: new SJF({ preemptive: true }) },
  ]);

  const generator = React.useMemo(() => new TickGenerator(), []);

  const [time, setTime] = React.useState(generator.time);
  const [isRunning, setIsRunning] = React.useState(false);

  const startGenerator = () => {
    generator.start();
    setIsRunning(true);
  };

  React.useEffect(() => {
    generator.addTickListener(() => {
      if (getTotalExecutionTime() <= generator.time) {
        generator.stop();
      }
      if (!generator.isRunning()) {
        setIsRunning(false);
      }
      setTime(generator.time);
    });
    schedulers.forEach((s) => s.scheduler.setTimeSource(() => generator.time));
  }, []);

  return (
    <div className="container">
      <div>time: {time}</div>
      <TimelineControls
        onPause={() => generator.stop()}
        onPlay={() => (getTotalExecutionTime() > time ? startGenerator() : null)}
        onProcessAdd={(length) => {
          let process = generateProcess(time, length);
          schedulers.forEach((s) => s.scheduler.addProcess(process));
          setScheduelers(
            schedulers.map((s) => ({
              scheduler: s.scheduler,
              currentQueue: s.scheduler.getProcessShards(),
            }))
          );
        }}
      />
      <div className="timelines">
        {schedulers.map((s, idx) => (
          <TimelineTrack scheduler={s.scheduler} key={idx} />
        ))}
        <TimelinePlayhead time={time} isRunning={isRunning} totalTime={getTotalExecutionTime()} setTime={setTime} />
      </div>
    </div>
  );
};
