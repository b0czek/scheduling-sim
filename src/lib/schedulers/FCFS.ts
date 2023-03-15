import { Process } from "../Process";
import { ProcessShard, ProcessShardQueue } from "../ProcessShard";
import { Scheduler } from "../Scheduler";

export class FCFS implements Scheduler {
    private initialProcesses: Process[] = [];
    private processes: Process[] = [];
    private queue: ProcessShardQueue = new ProcessShardQueue();
    private getTime: () => number = () => 0;

    private createShard = (process: Process): ProcessShard => ({
        process,
        shard_time: process.execution_time,
        completing: true,
        execution_start_time: this.getTotalExecutionTime(),
        remaining_time: 0,
    });

    private refreshQueue = () => {
        this.queue = new ProcessShardQueue();
        this.processes.forEach((process) => this.queue.push(this.createShard(process)));
    };

    public setInitialProcesses = (processes: Process[]) => {
        this.processes = [...processes];
        this.initialProcesses = [...processes];
        this.refreshQueue();
    };

    public addProcess = (process: Process) => {
        this.processes.push(process);
        this.queue.push(this.createShard(process));
    };

    public getTotalExecutionTime = (): number => {
        if (this.queue.length === 0) {
            return 0;
        }
        let lastProcess = this.queue.at(-1)!;
        return lastProcess.execution_start_time + lastProcess.shard_time;
    };

    public getCurrentProcessShard = (): ProcessShard | null => {
        let currentProcessIdx = this.queue.findShardIndex(this.getTime());
        if (currentProcessIdx === -1) {
            return null;
        }
        return this.queue[currentProcessIdx];
    };

    public getQueueSinceNow = (): ProcessShard[] => {
        let currentProcessIdx = this.queue.findShardIndex(this.getTime());
        if (currentProcessIdx === -1) {
            return [];
        }

        return this.queue.slice(currentProcessIdx);
    };

    public getProcessShards = () => this.queue;

    public setTimeSource = (source: () => number) => (this.getTime = source);

    public reset = () => this.setInitialProcesses(this.initialProcesses);

    public getWaitingTimes = (): Map<number, number> => {
        let queueNow = this.getQueueSinceNow();
        if (queueNow.length === 0) {
            return new Map<number, number>();
        }
        let now = this.getTime();
        return queueNow.reduce(
            (entryMap, s) =>
                entryMap.set(
                    s.process.pid,
                    s.execution_start_time - Math.max(queueNow[0].execution_start_time, s.process.arrival_time)
                ),
            new Map()
        );
    };

    public getName = () => "FCFS";
}
