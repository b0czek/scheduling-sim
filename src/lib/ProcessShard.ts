import { Process } from "./Process";

export interface ProcessShard {
    process: Process;
    shard_time: number;
    execution_start_time: number;
    completing: boolean;
}