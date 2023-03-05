import { Scheduler } from "../Scheduler";
import { FCFS } from "./FCFS";



describe("FCFS", () => {
    let scheduler : Scheduler;
    beforeAll(() => {
        scheduler = new FCFS();
        scheduler.setInitialProcesses([[0,2],[1,6],[2,4],[3,9],[6,12]].map((t, idx) => {
            return {
                arrival_time: t[0],
                execution_time: t[1],
                pid: idx
            } 
        }));
    });

    it("should calculate average waiting time properly", () => {
        expect(scheduler.getAverageWaitingTime()).toEqual(6.2);
    })
    it("should calculate waiting time of individual processes properly", () => {
         let waitingTimes = [0,1,6,9,15];
         expect(waitingTimes.every((t, idx) => {
            let waitingTime = scheduler.getWaitingTime(idx);
            console.log(waitingTime);
            return waitingTime === t;
         }
         )).toBeTruthy();
    });

});

export {};