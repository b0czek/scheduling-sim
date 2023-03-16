import { Process } from "../lib/Process";
import { Tooltip } from "react-tooltip";
import "./Timeline.css";

const tickWidth = 6;

export const TimelineChanges = ({ processes }: { processes: Process[] }) => {
    let p = processes.reduce(
        (entryMap, e) => entryMap.set(e.arrival_time, [...(entryMap.get(e.arrival_time) || []), e]),
        new Map<number, Process[]>()
    );

    let previousTime = 0;
    return (
        <div className="timeline-changes">
            {Array.from(p).map((time, idx) => {
                const spacerWidth = (time[0] - previousTime) * 50 - tickWidth;
                previousTime = time[0];
                return (
                    <div key={idx} className="timeline-change">
                        <div style={{ height: "100%", width: `${spacerWidth}px`, minWidth: `${spacerWidth}px` }}></div>
                        <div
                            className="timeline-change-tick"
                            data-tooltip-id={`tooltip-time${time[0]}`}
                            data-tooltip-content={`Dodane PIDy: ${time[1].map((p) => p.pid.toString()).join(",")}`}
                        ></div>

                        <Tooltip id={`tooltip-time${time[0]}`} />
                    </div>
                );
            })}
        </div>
    );
};
