import { ProcessShard } from "../ProcessShard";

export const findShardIdxInQueue = (queue: ProcessShard[], time: number): number => {
    if (queue.length === 0) {
        return -1;
    }
    let lastShard = queue.at(-1)!;
    if (time >= lastShard.execution_start_time + lastShard.shard_time) {
        return -1;
    }

    // binary search
    let l = 0;
    let r = queue.length - 1;
    while (l <= r) {
        let m = (l + r) >> 1;
        let s = queue[m];
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
