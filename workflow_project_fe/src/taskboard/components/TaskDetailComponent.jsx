import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorkcationTasks, updateTaskStatus } from "../api/Task";
import { downloadWorkFile } from "../../workcation/api/WorkcationApi";

import TaskStatusBadge from "./TaskStatusBadge";

import "../styles/TaskDetail.css";

function TaskDetailComponent() {
    const { workcationNo } = useParams();
    const navigate = useNavigate();
    const loginUser = JSON.parse(localStorage.getItem("user"));

    const [data, setData] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [panelTop, setPanelTop] = useState(120);
    const [rejectTask, setRejectTask] = useState(null);
    const [rejectContent, setRejectContent] = useState("");

    useEffect(() => {
        selectWorkcationTasks();
    }, [workcationNo]);

    // 조회
    const selectWorkcationTasks = async () => {
        try {
            const response = await getWorkcationTasks(workcationNo);
            setData(response);
        } catch (error) {
            console.error("워케이션 업무 조회 실패", error);
        }
    };

    //업무상세 목록에 따른 모달창위치
    const handleTaskClick = (task, e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        setSelectedTask(task);
        setPanelTop(rect.top);
    }

    //업무승인과 재검토 
    const handleTaskStatus = async (taskNo, status) => {
        let message = "";

        if (status === "Y") {
            message = "이 업무를 승인하시겠습니까?";
        } else if (status === "R") {
            message = "이 업무를 거부하시겠습니까?";
        } else if (status === "N") {
            message = "승인/거부 상태를 취소하고 재검토하시겠습니까?";
        }
        if (!window.confirm(message)) {
            return;
        }

        try {
            await updateTaskStatus(taskNo, status);

            if (status === "Y") {
                alert("승인되었습니다.");
            } else {
                alert("재검토 상태로 변경되었습니다.");
            }

            await selectWorkcationTasks();
        } catch (error) {
            console.error("업무 상태 변경 실패", error);
            alert("업무 상태 변경에 실패했습니다.");
        }
    };

    //거부사유 등록
    const handleReject = async () => {
        if (!rejectContent.trim()) {
            alert("거부 사유를 입력해주세요.");
            return;
        }
        if (!window.confirm("입력한사유로 업무를 거부하시겠습니까?")) {
            return
        }
        try {
            await updateTaskStatus(
                rejectTask.taskNo,
                "R",
                rejectContent
            )
            alert("거부되었습니다.");
            setRejectTask(null);
            setRejectContent("");
            await selectWorkcationTasks();
        } catch (error) {
            console.error("업무 거부 실패", error);
            alert("업무 거부에 실패했습니다.");
        }
    }

    //업무 상세내역 첨부파일
    if (!data) {
        return (
            <div className="content-area">
                <h2 align="center">업무 상세 조회</h2>
            </div>
        );
    }

    const fileList = data.taskList
        ?.flatMap(task => task.fileList || [])
        .filter(
            (file, index, arr) =>
                arr.findIndex(
                    item => item.taskFileNo === file.taskFileNo
                ) === index
        ) || [];



    return (
        <div className="content-area">
            <h2 align="center">업무 상세 조회</h2>

            <div className="task-summary">
                <div>
                    <span>워케이션 제목</span>
                    <span>{data.workcationTitle}</span>
                </div>

                <div>
                    <span>작성자</span>
                    <span>{data.writer}</span>
                </div>

                <div>
                    <span>업무 수</span>
                    <span>{data.taskCount}개</span>
                </div>

                <div>
                    <span>전체 진행도</span>
                    <span>{data.overallProgress}%</span>
                </div>
            </div>

            <table className="list-area">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>업무 제목</th>
                        <th>진행도</th>
                        <th>업무 시작일</th>
                        {loginUser?.authCode === "ADMIN" && (
                            <th></th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {data.taskList?.map((task) => (
                        <tr key={task.taskNo}
                            onClick={(e) => handleTaskClick(task, e)}
                            className="task-detail-row">
                            <td>{task.taskNo}</td>

                            <td>{task.taskTitle}</td>

                            <td>
                                <TaskStatusBadge
                                    progress={task.progress}
                                    status={task.status} />
                            </td>

                            <td>
                                {task.tasktimeAt
                                    ? task.tasktimeAt.substring(0, 10)
                                    : "-"}
                            </td>
                            {loginUser?.authCode === "ADMIN" && (
                                <td>
                                    {task.progress === 100 &&
                                        (!task.status || task.status === "N") && (
                                            <div className="task-approval-buttons">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTaskStatus(task.taskNo, "Y");
                                                    }}
                                                >
                                                    승인
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRejectTask(task);
                                                        setRejectContent("");
                                                    }}
                                                >
                                                    거부
                                                </button>
                                            </div>
                                        )}

                                    {task.progress === 100 && task.status === "R" && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTaskStatus(task.taskNo, "N");
                                            }}
                                        >
                                            재검토
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {fileList.length > 0 && (
                <div className="task-file-area">
                    <strong>첨부파일</strong>

                    {fileList.map((file) => (
                        <div key={file.taskFileNo}>
                            <button
                                type="button"
                                onClick={() =>
                                    downloadWorkFile(
                                        file.taskFileNo,
                                        file.originName
                                    )
                                }
                            >
                                {file.originName}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {(!data.taskList || data.taskList.length === 0) && (
                <div className="empty-message">
                    등록된 업무가 없습니다.
                </div>
            )}

            {selectedTask && (
                <div
                    className="task-history-overlay"
                    onClick={() => setSelectedTask(null)}>

                    <div className="task-history-panel"
                        style={{ top: `${panelTop}px` }}
                        onClick={(e) => e.stopPropagation()}>

                        <div className="task-history-header">
                            <strong>{selectedTask.taskTitle} </strong>
                        </div>

                        <div className="task-history-body">
                            {selectedTask.historyList?.length > 0 ? (
                                selectedTask.historyList.map((history) => (
                                    <div
                                        key={history.historyNo}
                                        className="task-history-content">
                                        {history.content}
                                    </div>
                                ))
                            ) : (
                                <div>작성 된 업무 내용이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="btn-set">
                <button
                    type="button"
                    onClick={() => navigate("/task/list")}
                >
                    목록
                </button>
            </div>
            {rejectTask && (
                <div
                    className="reject-modal-overlay"
                    onClick={() => setRejectTask(null)}>
                    <div
                        className="reject-modal"
                        onClick={(e) => e.stopPropagation()}>
                        <div>
                            업무 : {rejectTask.taskTitle}
                        </div>

                        <textarea
                            value={rejectContent}
                            onChange={(e) => setRejectContent(e.target.value)}
                            placeholder="거부 사유를 입력하세요." />

                        <div className="reject-modal-buttons">
                            <button
                                type="button"
                                onClick={handleReject} >
                                거부
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRejectTask(null);
                                    setRejectContent("");
                                }} >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskDetailComponent;