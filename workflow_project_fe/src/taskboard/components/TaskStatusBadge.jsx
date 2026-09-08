export const getStatusInfoByProgress = (progress) => {
    const num = Number(progress) || 0;

    if (num <= 0) {
        return {
            status: "업무 준비(0%)",
            className: "task-status-gray"
        };
    }

    if (num <= 50) {
        return {
            status: "진행 중 (1 ~ 50%)",
            className: "task-status-red"
        };
    }

    if (num < 100) {
        return {
            status: "진행 중 (51 ~ 99%)",
            className: "task-status-yellow"
        };
    }

    return {
        status: "완료 요청(100%)",
        className: "task-status-blue"
    };
};

function TaskStatusBadge({ progress }) {
    const info = getStatusInfoByProgress(progress);

    return (
        <span className={`task-status-badge ${info.className}`}>
            {info.status}
        </span>
    );
}

export default TaskStatusBadge;