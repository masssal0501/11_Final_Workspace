import React from "react";

function TaskProgressBar({progress=0}) {
    const percent = Math.min(100, Math.max(0, Number(progress) || 0));

    return (
        <div className="progressBar">
            <div className="progress-color"
                style={{ width: `${percent}%` }}>
                {percent > 0 && `${percent.toFixed(1)}%`}
            </div>
        </div>
    )
}

export default TaskProgressBar;