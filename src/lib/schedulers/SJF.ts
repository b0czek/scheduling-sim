import { Process } from "../Process";
import { ProcessShard } from "../ProcessShard";
import { Scheduler } from "../Scheduler";
import { findShardIdxInQueue } from "./utils";

export class SJF implements Scheduler {
    private initialProcesses: Process[] = [];
    private processes: Process[] = [];
    private queue: ProcessShard[] = [];
    private getTime: () => number = () => 0;
    private preemptive: boolean = false;

    constructor({ preemptive }: { preemptive: boolean }) {
        this.preemptive = preemptive;
    }

    private createFullShard = (process: Process): ProcessShard => {
        return {
            process,
            shard_time: process.execution_time,
            completing: true,
            execution_start_time: 0,
        };
    };
    // recalculate execution_start_time
    private refreshShards = (fromIdx: number) => {
        let completionTime = 0;
        if (fromIdx > 0) {
            let prev = this.queue[fromIdx - 1];
            completionTime = prev.execution_start_time + prev.shard_time;
        }

        for (let i = fromIdx; i < this.queue.length; i++) {
            let shard = this.queue[i];
            shard.execution_start_time = completionTime;
            completionTime += shard.shard_time;
        }
    };

    private getTotalExecutionTime = (): number => {
        if (this.queue.length === 0) {
            return 0;
        }
        let lastProcess = this.queue.at(-1)!;
        return lastProcess.execution_start_time + lastProcess.shard_time;
    };

    public setInitialProcesses = (processes: Process[]) => {
        this.initialProcesses = processes;
        this.processes = processes;
        this.queue = processes.sort((a, b) => a.execution_time - b.execution_time).map((p) => this.createFullShard(p));
        this.refreshShards(0);
    };

    private insertShard = (shard: ProcessShard, currentProcessShardIdx: number) => {
        let l = currentProcessShardIdx;
        let r = this.queue.length - 1;
        console.log("inserting shard", l, r);
        while (l <= r) {
            let m = (l + r) >> 1;
            let s = this.queue[m];
            if (s.shard_time > shard.shard_time) {
                r = m - 1;
            } else if (s.shard_time < shard.shard_time) {
                l = m + 1;
            } else {
                while (m !== this.queue.length && s.shard_time === shard.shard_time) {
                    m++;
                    s = this.queue[m];
                }
                l = m;
                break;
            }
        }
        this.queue.splice(l, 0, shard);
        console.log(l);
        this.refreshShards(l);
    };

    public addProcess = (process: Process) => {
        let now = this.getTime();
        let currentProcessShardIdx = findShardIdxInQueue(this.queue, now);
        console.log("CURRENT TIME: ", now, "CURRENT PROCESS SHARD IDX: ", currentProcessShardIdx);

        if (currentProcessShardIdx === -1) {
            console.log("no current process found " + now);
            this.processes.push(process);
            this.queue.push(this.createFullShard(process));
            this.refreshShards(this.queue.length - 1);
            return;
        }

        if (this.preemptive) {
            let shard = this.queue[currentProcessShardIdx];
            let remainingTime = shard.execution_start_time + shard.shard_time - now;
            // if new process is shorter and current process has been executing for at least 1 unit of time
            if (remainingTime > process.execution_time && now > shard.execution_start_time) {
                console.log("splitting current process " + shard.process.pid);
                // split shards
                shard.completing = false;
                shard.shard_time = now - shard.execution_start_time;

                let secondShard: ProcessShard = {
                    completing: true,
                    execution_start_time: shard.execution_start_time + shard.shard_time,
                    process: shard.process,
                    shard_time: remainingTime,
                };
                console.log(shard, secondShard);
                this.queue.splice(currentProcessShardIdx + 1, 0, secondShard);
            }
        }

        this.insertShard(this.createFullShard(process), currentProcessShardIdx);
    };
    public reset = () => {
        this.setInitialProcesses(this.initialProcesses);
    };
    public setTimeSource = (source: () => number) => {
        this.getTime = source;
    };
    public getProcessShards = () => {
        return this.queue;
    };
    public getCurrentProcessShard = () => {
        let currentProcessIdx = findShardIdxInQueue(this.queue, this.getTime());
        if (currentProcessIdx === -1) {
            return null;
        }
        return this.queue[currentProcessIdx];
    };

    public getQueueSinceNow = (): ProcessShard[] => {
        let currentProcessIdx = findShardIdxInQueue(this.queue, this.getTime());
        if (currentProcessIdx === -1) {
            return [];
        }

        return this.queue.slice(currentProcessIdx);
    };

    public getAverageWaitingTime = (): number => {
        let queueNow = this.getQueueSinceNow();
        if (queueNow.length === 0) {
            return 0;
        }
        let calculatedPids: Set<number> = new Set();
        let previousCompletionTime = 0;
        let totalWaitTime = queueNow
            .map((shard) => {
                let completionTime = previousCompletionTime + shard.shard_time;
                let waitingTime = 0;

                if (!calculatedPids.has(shard.process.pid)) {
                    waitingTime = completionTime - shard.process.arrival_time - shard.process.execution_time;
                } else {
                    calculatedPids.add(shard.process.pid);
                }

                previousCompletionTime = completionTime;
                return {
                    completionTime,
                    waitingTime,
                };
            })
            .reduce((acc, val) => acc + val.waitingTime, 0);
        return totalWaitTime / calculatedPids.size;
    };

    public getWaitingTime = (pid: number): number => {
        let queueNow = this.getQueueSinceNow();

        if (queueNow.length === 0) {
            return 0;
        }
        let shardIdx = queueNow.findIndex((shard) => shard.process.pid === pid);
        if (shardIdx === -1) {
            return 0;
        }
        let shard = queueNow[shardIdx];
        return shard.execution_start_time - shard.process.arrival_time;
    };
}
