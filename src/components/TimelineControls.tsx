import React from "react";

export const TimelineControls = (listener: TimelineControlsListener) => {
    const [processLength, setProcessLength] = React.useState<number | undefined>(undefined);
    const [quantumTime, setQuantumTime] = React.useState(1);
    return (
        <div className="timeline-controls">
            <input type="button" value="start" onClick={listener.onPlay} />
            <input type="button" value="stop" onClick={listener.onPause} />
            <input type="button" value="dodaj proces" onClick={() => listener.onProcessAdd(processLength)} />
            <input
                type="number"
                name="length"
                placeholder="długość procesu"
                style={{
                    width: "130px",
                }}
                value={processLength ?? ""}
                onChange={(e) => setProcessLength(e.target.value === "" ? undefined : +e.target.value)}
            />
            <span style={{ marginLeft: "30px" }}>kwant czasu </span>
            <input
                type="number"
                name="quantumTime"
                placeholder="kwant czasu"
                value={quantumTime}
                onChange={(e) => {
                    let newTime = +e.target.value || 1;
                    setQuantumTime(newTime);
                    listener.onQuantumTimeSet(newTime);
                }}
            />
        </div>
    );
};

export interface TimelineControlsListener {
    onPlay: () => void;
    onPause: () => void;
    onProcessAdd: (length?: number) => void;
    onQuantumTimeSet: (quantumTime: number) => void;
}
