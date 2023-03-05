import { start } from "repl";

const TICK_TIME_MS = 50;

export const TickGenerator = () => {
    
    return {
        tickListeners: [] as Array<() => void>,
        shouldContinue: false,
        time: 0,
        addTickListener(listener: () => void) {
            this.tickListeners.push(listener);
        },
        removeTickListener(listener: () => void) {
            this.tickListeners = this.tickListeners.filter(l => l !== listener);
        },
        start() {
            this.shouldContinue = true;
            setTimeout(this.timeoutCallback, TICK_TIME_MS);
        },
        stop() {
            this.shouldContinue = false;
        },
        timeoutCallback() {
            this.time++;
            this.tickListeners.forEach(listener => listener());
            if(this.shouldContinue) {
                
                setTimeout(this.timeoutCallback, TICK_TIME_MS);
            }

        }
    }
};