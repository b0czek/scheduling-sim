import { Process } from "../Process";
import { ProcessShard, ProcessShardQueue } from "../ProcessShard";
import { Scheduler } from "../Scheduler";

export class RoundRobinBatches extends Array<ProcessShardQueue> {
    public findBatchIndex = (time: number): number => {
        if (this.length === 0) {
            return -1;
        }
        let lastBatch = this.at(-1)!;
        if (time >= lastBatch.queueStartTime + lastBatch.queueTime) {
            return -1;
        }

        let l = 0;
        let r = this.length - 1;
        while (l <= r) {
            let m = (l + r) >> 1;
            let b = this[m];
            if (b.queueStartTime > time) {
                r = m - 1;
            } else if (b.queueStartTime + b.queueTime <= time) {
                l = m + 1;
            } else {
                return m;
            }
        }
        return -1;
    };
    public findShardLocation = (time: number): [number, number] | null => {
        let batchIdx = this.findBatchIndex(time);
        if (batchIdx === -1) {
            return null;
        }
        let shardIdx = this[batchIdx].findShardIndex(time);
        if (shardIdx === -1) {
            return null;
        }
        return [batchIdx, shardIdx];
    };
}

export class RR implements Scheduler {
    private initialProcesses: Process[] = [];
    private processes: Process[] = [];
    private batches: RoundRobinBatches = new RoundRobinBatches();
    private timeQuantum: number = 1;

    private getTime: () => number = () => 0;

    private findShardInPreviousBatch = (batchIdx: number, process: Process): ProcessShard | null => {
        if (!this.batches[batchIdx - 1]) {
            return null;
        }
        return this.batches[batchIdx - 1].find((shard) => shard.process.pid === process.pid) ?? null;
    };

    private calculateBatches = (sinceTime: number) => {
        let batchIdx = Math.max(this.batches.findBatchIndex(sinceTime), 0);
        if (this.batches[batchIdx]) {
            sinceTime = this.batches[batchIdx].queueStartTime;
        }
        this.batches = new RoundRobinBatches(...this.batches.slice(0, batchIdx));

        let p = this.processes.filter(
            (process) =>
                sinceTime <= process.arrival_time ||
                this.findShardInPreviousBatch(batchIdx, process)?.completing === false
        );
        let queueStartTime = 0;
        if (this.batches[batchIdx - 1]) {
            queueStartTime = this.batches[batchIdx - 1].queueStartTime + this.batches[batchIdx - 1].queueTime;
        }
        while (p.length > 0) {
            let queue = new ProcessShardQueue();
            queue.queueStartTime = queueStartTime;

            let removedPids: number[] = [];
            p.forEach((process, idx) => {
                if (process.arrival_time > queue.queueStartTime + queue.queueTime) {
                    console.log("skipping process from future", process.arrival_time, queueStartTime);
                    return;
                }
                let remainingTime =
                    this.findShardInPreviousBatch(batchIdx, process)?.remaining_time ?? process.execution_time;
                let shard_time = Math.min(remainingTime, this.timeQuantum);
                let completing = remainingTime - shard_time === 0;

                queue.push({
                    shard_time,
                    completing,
                    execution_start_time: queue.queueStartTime + queue.queueTime,
                    process: process,
                    remaining_time: remainingTime - shard_time,
                });
                queue.queueTime += shard_time;
                if (completing) {
                    removedPids.push(process.pid);
                }
            });
            queueStartTime = queue.queueStartTime + queue.queueTime;
            this.batches.splice(batchIdx, 1, queue);
            batchIdx++;
            p = p.filter((process) => !removedPids.includes(process.pid));
        }
    };

    public setInitialProcesses = (processes: Process[]) => {
        this.initialProcesses = [...processes];
        this.processes = [...processes];
        this.calculateBatches(0);
    };

    public addProcess = (process: Process) => {
        this.processes.push(process);
        this.calculateBatches(this.getTime());
    };

    public getCurrentProcessShard = (): ProcessShard | null => {
        let location = this.batches.findShardLocation(this.getTime());
        if (location == null) {
            return null;
        }
        return this.batches[location[0]][location[1]];
    };

    public getProcessShards = () => this.batches.flat();

    public reset = () => this.setInitialProcesses(this.initialProcesses);

    public setTimeSource = (source: () => number) => (this.getTime = source);

    public setTimeQuantum = (timeQuantum: number) => {
        this.timeQuantum = timeQuantum;
        this.calculateBatches(0);
    };

    private getBatchesSinceNow = (): RoundRobinBatches => {
        let batchIdx = Math.max(this.batches.findBatchIndex(this.getTime()), 0);
        return new RoundRobinBatches(...this.batches.slice(batchIdx, this.batches.length));
    };
    private calculateProcessWaitingTime = (startTime: number, processShards: ProcessShard[]): number => {
        if (processShards.length === 0) {
            return 0;
        }
        let waitTime = 0;
        let waitSince = Math.max(startTime, processShards[0].process.arrival_time);

        processShards.forEach((shard) => {
            waitTime += shard.execution_start_time - waitSince;
            waitSince = shard.execution_start_time + shard.shard_time;
        });
        return waitTime;
    };

    public getWaitingTimes = (): Map<number, number> => {
        let batches = this.getBatchesSinceNow();
        if (batches.length === 0) {
            return new Map<number, number>();
        }
        let currentProcessIdx = batches[0].findShardIndex(this.getTime());
        if (currentProcessIdx === -1) {
            return new Map<number, number>();
        }

        let groupedProcesses = batches
            .flat()
            .slice(currentProcessIdx)
            .reduce(
                (entryMap, s) => entryMap.set(s.process.pid, [...(entryMap.get(s.process.pid) || []), s]),
                new Map<number, ProcessShard[]>()
            );
        let waitingTimes = new Map<number, number>();
        for (let [pid, shards] of groupedProcesses) {
            waitingTimes.set(
                pid,
                this.calculateProcessWaitingTime(batches[0][currentProcessIdx].execution_start_time, shards)
            );
        }
        return waitingTimes;
    };

    public getName = () => "RoundRobin";
}
