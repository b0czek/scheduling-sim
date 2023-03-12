import { Process } from "./Process";
import { ProcessShard } from "./ProcessShard";

export interface Scheduler {
    setInitialProcesses: (processes: Process[]) => void;

    addProcess: (process: Process) => void;

    getCurrentProcessShard: () => ProcessShard | null;

    getProcessShards: () => ProcessShard[];

    setTimeSource: (source: () => number) => void;

    reset: () => void;
    
    getAverageWaitingTime: () => number; 
    
    getWaitingTime: (pid: number) => number;
    
    setTimeQuantum?: (timeQuantum: number) => void;
}