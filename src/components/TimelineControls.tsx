import React from "react";

export const TimelineControls = (listener: TimelineControlsListener) => {
  return (
    <div>
      <input type="button" value="start" onClick={listener.onPlay} />
      <input type="button" value="stop" onClick={listener.onPlay} />
      <input type="button" value="dodaj proces" />
    </div>
  );
};

export interface TimelineControlsListener {
  onPlay: () => void;
  onPause: () => void;
}
