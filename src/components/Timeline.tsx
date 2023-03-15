import React from "react";
import { Process } from "../lib/Process";
import { generateProcess, getGeneratedProcesses, getTotalExecutionTime } from "../lib/ProcessGenerator";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import { FCFS } from "../lib/schedulers/FCFS";
import { RR } from "../lib/schedulers/RR";
import { SJF } from "../lib/schedulers/SJF";
import { TickGenerator } from "../lib/TickGenerator";
import { TimelineControls } from "./TimelineControls";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { TimelineStatus } from "./TimelineStatus";
import { TimelineTrack } from "./TimelineTrack";

export interface SchedulerData {
    scheduler: Scheduler;
    currentQueue: ProcessShard[];
}

export const Timeline = () => {
    const [schedulers, setScheduelers] = React.useState<SchedulerData[]>([
        { currentQueue: [], scheduler: new FCFS() },
        { currentQueue: [], scheduler: new SJF({ preemptive: false }) },
        { currentQueue: [], scheduler: new SJF({ preemptive: true }) },
        { currentQueue: [], scheduler: new RR() },
    ]);

    const generator = React.useMemo(() => new TickGenerator(), []);

    const [time, setTime] = React.useState(generator.time);
    const [isRunning, setIsRunning] = React.useState(false);

    const startGenerator = () => {
        generator.start();
        setIsRunning(true);
    };

    const refreshSchedulers = () => {
        setScheduelers(
            schedulers.map((s) => ({
                scheduler: s.scheduler,
                currentQueue: s.scheduler.getProcessShards(),
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
            setTime(generator.time);
        });
        schedulers.forEach((s) => s.scheduler.setTimeSource(() => generator.time));
    }, []);

    return (
        <div className="container">
            <div>
                czas: {time}/{getTotalExecutionTime()}
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
                    for (const s of schedulers) {
                        if (s.scheduler.setTimeQuantum) {
                            s.scheduler.setTimeQuantum(time);
                        }
                    }
                    refreshSchedulers();
                }}
            />
            <div className="timelines-row">
                <TimelineStatus schedulers={schedulers} />
                <div className="timelines">
                    {schedulers.map((s, idx) => (
                        <TimelineTrack scheduler={s.scheduler} key={idx} />
                    ))}
                    <TimelinePlayhead
                        time={time}
                        isRunning={isRunning}
                        totalTime={getTotalExecutionTime()}
                        setTime={(time) => {
                            generator.setTime(time);
                            setTime(time);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
