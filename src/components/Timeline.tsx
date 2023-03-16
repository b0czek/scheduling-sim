import React from "react";
import { Process } from "../lib/Process";
import { generateProcess, getGeneratedProcesses, getTotalExecutionTime } from "../lib/ProcessGenerator";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import { FCFS } from "../lib/schedulers/FCFS";
import { RR } from "../lib/schedulers/RR";
import { SJF } from "../lib/schedulers/SJF";
import { TickGenerator } from "../lib/TickGenerator";
import { TimelineChanges } from "./TimelineChanges";
import { TimelineControls } from "./TimelineControls";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { TimelineStatus } from "./TimelineStatus";
import { TimelineTrack } from "./TimelineTrack";

export interface SchedulerData {
    scheduler: Scheduler;
    currentQueue: ProcessShard[];
    waitingTimes: Map<number, number>;
}

const createSchedulerData = (
    scheduler: Scheduler,
    currentQueue?: ProcessShard[],
    waitingTimes?: Map<number, number>
) => ({
    scheduler,
    currentQueue: currentQueue ?? [],
    waitingTimes: waitingTimes ?? new Map<number, number>(),
});

export const Timeline = () => {
    const [schedulers, setScheduelers] = React.useState<SchedulerData[]>([
        createSchedulerData(new FCFS()),
        createSchedulerData(new SJF({ preemptive: false })),
        createSchedulerData(new SJF({ preemptive: true })),
        createSchedulerData(new RR()),
    ]);

    const generator = React.useMemo(() => new TickGenerator(), []);

    const [time, setTime] = React.useState(generator.time);
    const [isRunning, setIsRunning] = React.useState(false);

    const updateTime = (time: number) => {
        setTime(time);
        refreshSchedulers();
    };

    const startGenerator = () => {
        generator.start();
        setIsRunning(true);
    };

    const refreshSchedulers = () => {
        setScheduelers(
            schedulers.map((s) => ({
                scheduler: s.scheduler,
                currentQueue: s.scheduler.getProcessShards(),
                waitingTimes: s.scheduler.getWaitingTimes(),
            }))
        );
    };

    React.useEffect(() => {
        generator.addTickListener(() => {
            if (getTotalExecutionTime() <= generator.time) {
                generator.stop();
            }
            if (!generator.isRunning()) {
                setIsRunning(false);
            }
            updateTime(generator.time);
        });
        schedulers.forEach((s) => s.scheduler.setTimeSource(() => generator.time));
    }, []);

    return (
        <div className="container">
            <div>
                <h2>
                    czas: {time}/{getTotalExecutionTime()}
                </h2>
            </div>
            <TimelineControls
                onPause={() => generator.stop()}
                onPlay={() => (getTotalExecutionTime() > time ? startGenerator() : null)}
                onProcessAdd={(length) => {
                    let process: Process;
                    try {
                        process = generateProcess(time, length);
                    } catch {
                        alert("nie można utworzyć procesu w przeszłości");
                        return;
                    }
                    schedulers.forEach((s) => s.scheduler.addProcess(process));
                    refreshSchedulers();
                }}
                onQuantumTimeSet={(time) => {
                    schedulers
                        .filter((s) => s.scheduler.setTimeQuantum)
                        .forEach((s) => s.scheduler.setTimeQuantum!(time));
                    refreshSchedulers();
                }}
            />
            <div className="timelines-row">
                <TimelineStatus schedulers={schedulers} />
                <div className="timelines">
                    <TimelinePlayhead
                        time={time}
                        isRunning={isRunning}
                        totalTime={getTotalExecutionTime()}
                        setTime={(time) => {
                            generator.setTime(time);
                            updateTime(time);
                        }}
                    />
                    {schedulers.map((s, idx) => (
                        <TimelineTrack scheduler={s} key={idx} />
                    ))}
                    <TimelineChanges processes={getGeneratedProcesses()} />
                </div>
            </div>
        </div>
    );
};
