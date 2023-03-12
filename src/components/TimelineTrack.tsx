import React from "react";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import "./Timeline.css";

const TimelineBlock = ({ shard }: { shard: ProcessShard }) => {
    const w = shard.shard_time * 50 - 10;
    return (
        <div className={`timeline-block`} style={{ width: w, minWidth: w }}>
            <div className={`timeline-block-content ${shard.completing ? "timeline-block-content-completing" : ""}`}>
                {shard.process.pid}
            </div>
        </div>
    );
};

export const TimelineTrack = ({ scheduler }: { scheduler: Scheduler }) => {
    return (
        <div className="timeline-track">
            {scheduler.getProcessShards().map((shard, idx) => (
                <TimelineBlock shard={shard} key={idx} />
            ))}
        </div>
    );
};
