import { ProcessShard } from "./ProcessShard";
import { Scheduler } from "./Scheduler";

interface SchedulerData {
    scheduler: Scheduler;
    currentQueue: ProcessShard[];
}

export class Schedulers extends Array<Scheduler> {
    private timeSource: () => number;

    constructor(timeSource: () => number, ...items: Scheduler[]) {
        super();
        this.timeSource = timeSource;
        this.push(...items);
    }

    public push(...items: Scheduler[]): number {
        items.forEach((s) => s.setTimeSource(this.timeSource));
        return super.push(...items);
    }

    public getSchedulerData = () => {
        return this.map((scheduler) => ({} as SchedulerData));
    };
}
