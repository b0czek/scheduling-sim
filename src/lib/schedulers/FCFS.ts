import { Process } from "../Process";
import { ProcessShard } from "../ProcessShard";
import { Scheduler } from "../Scheduler";
import { findShardIdxInQueue } from "./utils";

export class FCFS implements Scheduler {
  private initialProcesses: Process[] = [];
  private processes: Process[] = [];
  private queue: ProcessShard[] = [];
  private getTime: () => number = () => 0;

  private createShard = (process: Process): ProcessShard => ({
    process,
    shard_time: process.execution_time,
    completing: true,
    execution_start_time: this.getTotalExecutionTime(),
  });

  private refreshQueue = () => {
    this.queue = [];
    this.processes.forEach((process) => this.queue.push(this.createShard(process)));
  };

  public setInitialProcesses = (processes: Process[]) => {
    this.processes = processes;
    this.initialProcesses = processes;
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

  public getProcessShards = () => this.queue;

  public setTimeSource = (source: () => number) => (this.getTime = source);

  public reset = () => this.setInitialProcesses(this.initialProcesses);

  public getAverageWaitingTime = () => {
    let queueNow = this.getQueueSinceNow();
    if (queueNow.length === 0) {
      return 0;
    }
    let previousCompletionTime = 0;
    let totalWaitTime = queueNow
      .map((shard) => {
        let completionTime = previousCompletionTime + shard.shard_time;
        let waitingTime = completionTime - shard.process.arrival_time - shard.process.execution_time;
        previousCompletionTime = completionTime;
        return {
          completionTime,
          waitingTime,
        };
      })
      .reduce((acc, val) => acc + val.waitingTime, 0);
    return totalWaitTime / queueNow.length;
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
