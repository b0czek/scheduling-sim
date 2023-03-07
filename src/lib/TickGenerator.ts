import { start } from "repl";

const TICK_TIME_MS = 250;

export class TickGenerator {
    
        private  tickListeners: Array<() => void> = [];
        private shouldContinue:boolean = false;
        public time: number = 0;
        public addTickListener = (listener: () => void) => {

            this.tickListeners.push(listener);
        }

        public removeTickListener = (listener: () => void) => {
            this.tickListeners = this.tickListeners.filter(l => l !== listener);
        }
        public start = () => {
            this.shouldContinue = true;
            setTimeout(this.timeoutCallback, TICK_TIME_MS);
        }
        
        public stop = () => {
        
            this.shouldContinue = false;
        }
        public timeoutCallback = () => {
        
            this.time++;
            this.tickListeners.forEach(listener => listener());
            if(this.shouldContinue) {
                
                setTimeout(this.timeoutCallback, TICK_TIME_MS);
            }

    }
};