import { SchedulerData } from "./Timeline";

const averageWaitTime = (waitingTimes: Map<number, number>) => {
    if (waitingTimes.size === 0) {
        return 0;
    }
    return (Array.from(waitingTimes).reduce((a, b) => a + b[1], 0) / waitingTimes.size).toFixed(2);
};

const Status = ({ scheduler }: { scheduler: SchedulerData }) => {
    const currentProcessShard = scheduler.scheduler.getCurrentProcessShard();
    return (
        <div className="timeline-status">
            <div style={{ fontWeight: "bolder" }}>{scheduler.scheduler.getName()}</div>
            <div>PID procesu: {currentProcessShard?.process.pid}</div>
            <div>Średni czas oczekiwania:{averageWaitTime(scheduler.waitingTimes)} </div>
        </div>
    );
};

export const TimelineStatus = ({ schedulers }: { schedulers: SchedulerData[] }) => {
    return (
        <div className="timeline-statuses">
            {schedulers.map((scheduler, idx) => (
                <Status scheduler={scheduler} key={idx} />
            ))}
        </div>
    );
};
