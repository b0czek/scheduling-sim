import { Process } from "./Process";
import { ProcessShard } from "./ProcessShard";

export interface Scheduler {
    setInitialProcesses: (processes: Process[]) => void;

    addProcess: (process: Process) => void;

    getCurrentProcessShard: () => ProcessShard | null;

    getProcessShards: () => ProcessShard[];

    setTimeSource: (source: () => number) => void;

    reset: () => void;

    getWaitingTimes: () => Map<number, number>;

    setTimeQuantum?: (timeQuantum: number) => void;

    getName: () => string;
}
