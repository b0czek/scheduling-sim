import { Scheduler } from "../lib/Scheduler";
import { SchedulerData } from "./Timeline";

const Status = ({ scheduler }: { scheduler: Scheduler }) => {
    const currentProcessShard = scheduler.getCurrentProcessShard();
    return (
        <div className="timeline-status">
            <div style={{ fontWeight: "bolder" }}>{scheduler.getName()}</div>
            <div>PID procesu: {currentProcessShard?.process.pid}</div>
            <div>Średni czas oczekiwania:{scheduler.getAverageWaitingTime().toFixed(2)} </div>
        </div>
    );
};

export const TimelineStatus = ({ schedulers }: { schedulers: SchedulerData[] }) => {
    return (
        <div className="timeline-statuses">
            {schedulers.map((scheduler, idx) => (
                <Status scheduler={scheduler.scheduler} key={idx} />
            ))}
        </div>
    );
};
