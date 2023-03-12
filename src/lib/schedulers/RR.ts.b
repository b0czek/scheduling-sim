import { Process } from "../Process";
import { ProcessShard } from "../ProcessShard";
import { Scheduler } from "../Scheduler";


export class RR implements Scheduler {
    private initialProcesses: Process[] = [];
    private processes: Process[] = [];
    private queue: ProcessShard[] = [];
    private timeQuantum: number = 1;
    
    private getTime : () => number = () => 0;
 
    private setInitialProcesses = (processes: Process[]) => {
        this.initialProcesses = [...processes];
        this.processes = [...processes];
        
    }
}