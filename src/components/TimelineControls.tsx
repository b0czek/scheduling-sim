import React from "react";

export const TimelineControls = (listener: TimelineControlsListener) => {
  const [processLength, setProcessLength] = React.useState<number | undefined>(
    undefined
  );
  return (
    <div>
      <input type="button" value="start" onClick={listener.onPlay} />
      <input type="button" value="stop" onClick={listener.onPause} />
      <input
        type="button"
        value="dodaj proces"
        onClick={() => listener.onProcessAdd(processLength)}
      />
      <input
        type="number"
        name="length"
        value={processLength ?? ""}
        onChange={(e) =>
          setProcessLength(e.target.value === "" ? undefined : +e.target.value)
        }
      />
    </div>
  );
};

export interface TimelineControlsListener {
  onPlay: () => void;
  onPause: () => void;
  onProcessAdd: (length?: number) => void;
}
