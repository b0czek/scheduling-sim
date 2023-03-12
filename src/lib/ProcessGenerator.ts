import { Process } from "./Process";

let pid = 0;
let totalExecutionTime = 0;

export const generateProcess = (now: number, length?: number): Process => {
    let execution_time = length ?? Math.floor(Math.random() * 15 + 1);
    totalExecutionTime += execution_time;
    return {
        arrival_time: now,
        execution_time: execution_time,
        pid: pid++,
    };
};

export const getTotalExecutionTime = () => totalExecutionTime;
