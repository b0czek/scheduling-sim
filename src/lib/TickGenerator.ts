const TICK_TIME_MS = 250;

export class TickGenerator {
    private tickListeners: Array<() => void> = [];
    private shouldContinue: boolean = false;
    private timeout: NodeJS.Timeout | null = null;
    public time: number = 0;
    public addTickListener = (listener: () => void) => {
        this.tickListeners.push(listener);
    };

    public removeTickListener = (listener: () => void) => {
        this.tickListeners = this.tickListeners.filter((l) => l !== listener);
    };
    public start = () => {
        this.shouldContinue = true;
        this.timeout = setTimeout(this.timeoutCallback, TICK_TIME_MS);
    };

    public stop = () => {
        this.shouldContinue = false;
    };
    public timeoutCallback = () => {
        this.timeout = null;
        this.time++;
        this.tickListeners.forEach((listener) => listener());

        if (this.shouldContinue) {
            this.timeout = setTimeout(this.timeoutCallback, TICK_TIME_MS);
        }
    };

    public setTime = (time: number) => (this.time = time);

    public isRunning = () => {
        return this.shouldContinue || this.timeout !== null;
    };
}
