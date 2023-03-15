import { Process } from "../lib/Process";
import { getGeneratedProcesses } from "../lib/ProcessGenerator";

export const TimelineChanges = ({ processes }: { processes: Process[] }) => {
    let p = processes.reduce(
        (entryMap, e) => entryMap.set(e.arrival_time, [...(entryMap.get(e.arrival_time) || []), e]),
        new Map()
    );
    return <div></div>;
};
