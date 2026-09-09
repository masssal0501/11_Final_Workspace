import React from "react";
import "../styles/TaskStatusBadge.css";

//1. 상태 명칭기반 매핑 
const statusConfigMap = {
    "업무 준비(0%)": { className: "status-gray", progress: 0 },//회색
    "진행 중 (1 ~ 50%)": { className: "status-red", progress: 30 },//빨강
    "진행 중 (51 ~ 99%)": { className: "status-yellow", progress: 75 },//노랑
    "완료 요청(100%)": { className: "status-blue", progress: 100 },//파랑
    "업무 완료": { className: "status-green", progress: 100 }//초록         
};

//2. 숫자로 된 진행도(예:35) 구간에 맞는 뱃지 정보로 변환 해주는 함수
export const getStatusInfoByProgress = (progress, status) => {

    //관리자 승인 이후 업무완료 상태가 넘어온 경우 우선 처리
    if (status == "업무 완료") {
        return { status: "업무 완료", className: "status-green" };
    }

    const num = Number(progress) || 0;

    if (num <= 0) return { status: "업무 준비(0%)", className: "status-gray" };
    if (num <= 50) return { status: "진행 중 (1 ~ 50%)", className: "status-red" };
    if (num < 100) return { status: "진행 중 (51 ~ 99%)", className: "status-yellow" };

    //100%지만 승인받지 않은 상태
    return { status: "완료 요청(100%)", className: "status-blue" };
}

//3. TaskDetailComponent 에서 사용할 함수
export const getProgressByStatus = (status) => {
    return statusConfigMap[status]?.progress ?? 0;
};

//4.BadgeComponent = status 와 progress 를 받아 변환
function TaskStatusBadge({ status, progress }) {
    let displayStatus = status;
    let badgeClass = "status-gray";

    //a.업무완료 상태인지 우선 판별
    if (status == "업무 완료") {
        displayStatus = "업무 완료";
        badgeClass = "status-green";

        //b.progress 수치가 있는경우 (status도 전달)
    } else if (progress !== undefined && progress !== null) {
        const info = getStatusInfoByProgress(progress, status);
        displayStatus = info.status;
        badgeClass = info.className;

        //c.status 문자열 전달.
    } else if (statusConfigMap[status]) {
        badgeClass = statusConfigMap[status].className;
    }

    return (
        <span className={`task-status-badge ${badgeClass}`} >
            {displayStatus}
        </span>
    );
}

export default TaskStatusBadge;