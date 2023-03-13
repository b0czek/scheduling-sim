import { Process } from "./Process";

export interface ProcessShard {
    process: Process;
    shard_time: number;
    execution_start_time: number;
    completing: boolean;
    remaining_time: number;
}

export class ProcessShardQueue extends Array<ProcessShard> {
    public queueTime = 0;
    public queueStartTime = 0;

    public findShardIndex = (time: number): number => {
        if (this.length === 0) {
            return -1;
        }
        let lastShard = this.at(-1)!;
        if (time >= lastShard.execution_start_time + lastShard.shard_time) {
            return -1;
        }

        // binary search
        let l = 0;
        let r = this.length - 1;
        while (l <= r) {
            let m = (l + r) >> 1;
            let s = this[m];
            if (s.execution_start_time > time) {
                r = m - 1;
            } else if (s.execution_start_time + s.shard_time <= time) {
                l = m + 1;
            } else {
                return m;
            }
        }
        return -1;
    };
}
