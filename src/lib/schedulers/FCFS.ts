import { Process } from "../Process";
import { ProcessShard } from "../ProcessShard";
import { Scheduler } from "../Scheduler";

export class FCFS implements Scheduler  {
    private initialProcesses: Process[] = [];
    private processes: Process[] = [];
    private queue: ProcessShard[] = [];
    private getTime: () => number = () => 0;

    private createShard = (process: Process): ProcessShard => { return {
        process: process,
        shard_time: process.execution_time,
        completing: true,
        execution_start_time: this.getTotalExecutionTime(),
    }};

    private refreshQueue = () =>{
        this.queue = [];
        this.processes.forEach(process => this.queue.push(this.createShard(process)));
    }

    setInitialProcesses = (processes: Process[]) => {
        this.processes = processes;
        this.initialProcesses = processes;
        this.refreshQueue();

    }

    addProcess = (process: Process) => {
        this.processes.push(process);
        this.queue.push(this.createShard(process));
    }

    getTotalExecutionTime = (): number => {
        if(this.queue.length === 0) {
            return 0;
        }
        let lastProcess = this.queue.at(-1)!;
        return lastProcess.execution_start_time + lastProcess.shard_time;
    }

    getShardExecutingAtTime = (time: number): number => {
        if(this.queue.length === 0) {
            return -1;
        } 
        let lastShard = this.queue.at(-1)!;
        if(time > lastShard.execution_start_time + lastShard.shard_time) {
            return -1;
        }

        // binary search
        let l = 0;
        let r = this.queue.length - 1;
        while(l <= r) {
            let m = (l + r) >> 1;
            let s = this.queue[m];
            if(s.execution_start_time > time) {
                r = m - 1;
            }
            else if(s.execution_start_time + s.shard_time <= time) {
                l = m + 1;
            }
            else {
                return m;
            }
        }
        return -1;
    }

    getCurrentProcessShard = (): ProcessShard | null => {
        let currentProcessIdx = this.getShardExecutingAtTime(this.getTime());
        if(currentProcessIdx === -1) {
            return null;
        }
        return this.queue[currentProcessIdx];
    };


    getQueueSinceNow = (): ProcessShard[] => {
        let currentProcessIdx = this.getShardExecutingAtTime(this.getTime());
        if(currentProcessIdx === -1) {
            return [];
        }

        return this.queue.slice(currentProcessIdx);
    };


    getProcessShards = () => this.queue;

    setTimeSource = (source: () => number) => this.getTime = source;

    reset = () => this.setInitialProcesses(this.initialProcesses);

    getAverageWaitingTime = () => {
        let queueNow = this.getQueueSinceNow();
        if(queueNow.length === 0) {
            return 0;
        }
        let previousCompletionTime = 0;
        let totalWaitTime = queueNow.map(shard => {
            let completionTime = previousCompletionTime + shard.shard_time;
            let waitingTime = completionTime - shard.process.arrival_time - shard.process.execution_time;
            previousCompletionTime = completionTime;
            return {
                completionTime,
                waitingTime
            }
        })
        .map(s => s.waitingTime)
        .reduce((acc, val) => acc + val, 0);
        return totalWaitTime / queueNow.length;
    }

    getWaitingTime = (pid: number): number => {
        let queueNow = this.getQueueSinceNow();

        if(queueNow.length === 0) {
            return 0;
        }
        let processIdx = queueNow.findIndex(shard => shard.process.pid === pid);
        if(processIdx === -1) {
            return 0;
        }
        let process = queueNow[processIdx].process;
        let completionTime = queueNow.slice(0, processIdx + 1).reduce((acc, val) => acc + val.shard_time, 0);
        return completionTime - process.arrival_time - process.execution_time;
    };

};