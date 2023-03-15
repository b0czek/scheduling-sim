import React from "react";
import { ProcessShard } from "../lib/ProcessShard";
import { Scheduler } from "../lib/Scheduler";
import ColorHash from "color-hash";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import "./Timeline.css";

const colorHash = new ColorHash();

const hashPid = (pid: number) => {
    return colorHash.hex(`${pid}+`);
};

const TimelineBlock = ({ scheduler, shard }: { scheduler: Scheduler; shard: ProcessShard }) => {
    const w = shard.shard_time * 50 - 10;
    const tooltipId = `${scheduler.getName()}-${shard.execution_start_time}`;
    return (
        <div className={`timeline-block`} style={{ width: w, minWidth: w }}>
            <div
                style={{ backgroundColor: hashPid(shard.process.pid) }}
                className={`timeline-block-content ${shard.completing ? "timeline-block-content-completing" : ""}`}
                data-tooltip-content={`czas oczekiwania: ${scheduler.getWaitingTime(shard.process.pid)}`}
                data-tooltip-id={tooltipId}
            >
                <span>{shard.process.pid}</span>
            </div>
            <Tooltip id={tooltipId} />
        </div>
    );
};

export const TimelineTrack = ({ scheduler }: { scheduler: Scheduler }) => {
    return (
        <div className="timeline-track">
            {scheduler.getProcessShards().map((shard, idx) => (
                <TimelineBlock shard={shard} key={idx} scheduler={scheduler} />
            ))}
        </div>
    );
};
