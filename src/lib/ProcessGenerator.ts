import { Process } from "./Process";

let pid = 0;
let totalExecutionTime = 0;
let lastAddedProcessTime = 0;
let generatedProcesses: Process[] = [];

export const generateProcess = (now: number, length?: number): Process => {
    if (now < lastAddedProcessTime) {
        throw new Error("cannot add process in past");
    }
    let execution_time = Math.max(length ?? Math.floor(Math.random() * 15 + 1), 1);
    totalExecutionTime += execution_time;
    lastAddedProcessTime = now;
    let process = {
        arrival_time: now,
        execution_time: execution_time,
        pid: pid++,
    };
    generatedProcesses.push(process);
    return process;
};

export const getTotalExecutionTime = () => totalExecutionTime;

export const getGeneratedProcesses = () => generatedProcesses;
