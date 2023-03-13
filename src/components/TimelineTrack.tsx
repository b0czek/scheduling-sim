import React from "react";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import ColorHash from "color-hash";
import "./Timeline.css";

const colorHash = new ColorHash();

const hashPid = (pid: number) => {
    return colorHash.hex(`${pid}+`);
};

const TimelineBlock = ({ shard }: { shard: ProcessShard }) => {
    const w = shard.shard_time * 50 - 10;
    return (
        <div className={`timeline-block`} style={{ width: w, minWidth: w }} onMouseOver={() => console.log(shard)}>
            <div
                style={{ backgroundColor: hashPid(shard.process.pid) }}
                className={`timeline-block-content ${shard.completing ? "timeline-block-content-completing" : ""}`}
            >
                <span>{shard.process.pid}</span>
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
