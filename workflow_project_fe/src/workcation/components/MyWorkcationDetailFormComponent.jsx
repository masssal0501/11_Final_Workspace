
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getMyWorkcationDetail, deleteWorkcation, saveTaskProgress } from "../api/WorkcationApi";

import "../styles/MyWorkcationDetail.css";

function MyWorkcationDetailFormComponent() {
    const navigate = useNavigate();

    const [detailData, setDetailData] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskProgress, setTaskProgress] = useState(0);

    const [taskReportTitle, setTaskReportTitle] = useState("");
    const [taskReportContent, setTaskReportContent] = useState("");
    const [taskFile, setTaskFile] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [activityList, setActivityList] = useState([]);

    const { workcationNo } = useParams();

    useEffect(() => {
        getMyWorkcationDetail(workcationNo)
            .then(res => {
                setDetailData(res);
            })
            .catch(err => {
                console.error("내 워케이션 조회 실패:", err);
            });
    }, [workcationNo]);

    if (!detailData) {
        return (
            <div className="my-workcation-detail-container">
                <h2 align="center">내 워케이션</h2>
                <p align="center" style={{ marginTop: "30px", color: "#666" }}>
                    등록된 워케이션 내역이 없습니다.
                </p>
            </div>
        );
    }

    const {
        workcationNo: detailWorkcationNo = "",
        workcationTitle = "",
        startDate = "",
        endDate = "",
        mainRegion = "",
        subRegion = "",
        planList = [],
        approverState = ""
    } = detailData;

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteWorkcation(detailWorkcationNo);
            alert("삭제가 완료되었습니다.");
            navigate("/workcation/mylist");
        } catch (err) {
            console.error("삭제 실패 :", err);
            alert("삭제 중 오류 발생");
        }
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const handleProgressChange = (e) => {

        const rect =
            e.currentTarget.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        let percent =
            (x / rect.width) * 100;

        percent =
            Math.max(
                0,
                Math.min(100, percent)
            );

        // 이동단위
        percent =
            Math.round(percent / 5) * 5;

        setTaskProgress(percent);
    };

    const openTaskModal = (task) => {

        setSelectedTask(task);

        setTaskProgress(
            task.progress ?? 0
        );

        setTaskReportTitle(
            task.taskTitle ?? ""
        );

        setTaskReportContent(
            task.taskContent ?? ""
        );

        setTaskFile(null);
    };

    const handleTaskSave = async () => {

        if (!taskReportTitle.trim()) {
            alert("업무 리포트 제목을 입력해주세요.");
            return;
        }

        if (!taskReportContent.trim()) {
            alert("업무 리포트 내용을 입력해주세요.");
            return;
        }

        const requestData = {
            taskNo: selectedTask.taskNo,
            progress: taskProgress,
            title: taskReportTitle,
            content: taskReportContent
        };

        try {

            await saveTaskProgress(requestData, taskFile);

            alert("업무 진행 상황이 저장되었습니다.");

            setSelectedTask(null);

            // 상세페이지 데이터 다시 조회
            const res =
                await getMyWorkcationDetail(
                    workcationNo
                );

            setDetailData(res);

        } catch (error) {

            console.error(
                "업무 저장 실패:",
                error
            );

            alert(
                "업무 저장 중 오류가 발생했습니다."
            );
        }
    };

    const totalTasks = planList.length;
    const completedTasks = planList.filter(item => (item.progress || 0) === 100).length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="my-workcation-detail-container">
            <div className="detail-top-nav">
                <h2 align="center">내 워케이션 내용</h2>
                <button className="back-list-btn" onClick={() => navigate('/workcation/mylist')}>
                    목록으로
                </button>
            </div>

            <div className="workcation-info-card">
                <div className="info-row-top">
                    <span className="info-title">{workcationTitle || "제목 없음"}</span>
                    <span className="info-date">{startDate} ~ {endDate}</span>
                </div>
                <hr className="info-divider" />
                <div className="info-row-bottom">
                    <span>{mainRegion} {subRegion}</span>
                </div>
            </div>

            <div className="task-manage-section">
                <div className="task-manage-header">
                    <h3>내 워케이션 업무</h3>
                </div>

                <div className="progress-overview-box">
                    <div className="progress-title-area">
                        <span>전체 업무 진행률</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }}>
                            <span className="progress-text">{overallProgress}%</span>
                        </div>
                    </div>
                    <div className="progress-status-text">
                        완료 {completedTasks} / 전체 {totalTasks}
                        <p className="sub-guide-text">체크 표시가 되어야 완료!!</p>
                    </div>
                </div>

                <ul className="my-task-list">
                    {planList.map((item, index) => {
                        const progress = item.progress || 0;
                        const isCompleted = progress === 100;

                        return (
                            <li
                                className="my-task-item"
                                key={item.id || index}
                                onClick={() => openTaskModal(item)}
                            >
                                <div className="task-item-left">
                                    <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        readOnly
                                    />
                                    <span className={isCompleted ? "completed-text" : ""}>{item.taskName}</span>
                                </div>
                                <div className="task-item-right">
                                    <span className="progress-label">
                                        {progress}% {isCompleted ? "완료" : progress > 0 ? "진행" : "대기"}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="my-detail-button-area">
                {approverState === "A" && (
                    <button
                        type="button"
                        className="back-list-btn"
                        onClick={() => navigate(`/survey/${detailWorkcationNo}`)}
                    >
                        만족도 조사 작성
                    </button>
                )}
                <button type="button" className="delete-workcation-btn" onClick={handleDelete}>
                    워케이션 취소/삭제
                </button>
            </div>

            {selectedTask && (
                <div className="task-modal-overlay">
                    <div className="task-modal-box">

                        <div className="task-modal-header">
                            <h2>{selectedTask.taskTitle}</h2>

                            <button
                                type="button"
                                onClick={() => setSelectedTask(null)}
                            >
                                ×
                            </button>
                        </div>

                        {/* 진행률 */}
                        <div className="task-modal-section">
                            <h4>진행률</h4>

                            <div
                                className="modal-progress-bar-bg"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                    handleProgressChange(e);
                                }}
                                onMouseMove={(e) => {
                                    if (isDragging) {
                                        handleProgressChange(e);
                                    }
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                            >
                                <div
                                    className="modal-progress-bar-fill"
                                    style={{
                                        width: `${taskProgress}%`
                                    }}
                                />

                                <span className="modal-progress-text">
                                    {taskProgress}%
                                </span>
                            </div>
                        </div>


                        {/* 최근 활동 */}
                        <div className="task-modal-section">
                            <h4>최근 활동</h4>

                            {activityList.length === 0 ? (
                                <p>등록된 최근 활동이 없습니다.</p>
                            ) : (
                                <div className="activity-list">

                                    {activityList
                                        .filter(
                                            activity =>
                                                activity.taskNo === selectedTask.taskNo
                                        )
                                        .map(activity => (
                                            <div
                                                key={activity.activityNo}
                                                className="activity-item"
                                            >
                                                <span>
                                                    {activity.activityTitle}
                                                </span>

                                                <span>
                                                    {activity.createdAt}
                                                </span>

                                                <span>
                                                    {activity.progress}%
                                                </span>
                                            </div>
                                        ))}

                                </div>
                            )}
                        </div>


                        {/* 첨부파일 */}
                        <div className="task-modal-section">
                            <h4>첨부파일</h4>

                            <input
                                type="file"
                                onChange={(e) => {
                                    setTaskFile(e.target.files[0]);
                                }}
                            />
                        </div>


                        {/* 업무 리포트 */}
                        <div className="task-modal-section">
                            <h4>업무 리포트</h4>

                            <input
                                type="text"
                                placeholder="오늘 처리한 업무의 이름이나 종류를 입력해주세요."
                                value={taskReportTitle}
                                onChange={(e) =>
                                    setTaskReportTitle(e.target.value)
                                }
                            />

                            <textarea
                                placeholder="오늘 처리한 업무 내용을 작성해주세요."
                                value={taskReportContent}
                                onChange={(e) =>
                                    setTaskReportContent(e.target.value)
                                }
                            />
                        </div>


                        <div className="task-modal-buttons">
                            <button
                                type="button"
                                onClick={() => setSelectedTask(null)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                onClick={handleTaskSave}
                            >
                                저장
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div >
    );
}


export default MyWorkcationDetailFormComponent;