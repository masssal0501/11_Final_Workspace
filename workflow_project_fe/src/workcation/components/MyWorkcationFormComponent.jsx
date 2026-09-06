
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWorkcation, deleteWorkcation } from "../api/WorkcationApi";
import "../styles/WorkcationDetail.css";

function MyWorkcationFormComponent() {
    const navigate = useNavigate();

    const [detailData, setDetailData] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskProgress, setTaskProgress] = useState(0);
    const [taskReport, setTaskReport] = useState("");

    useEffect(() => {
        getMyWorkcation() 
            .then(res => {
                setDetailData(res);
            })
            .catch(err => {
                console.error("내 워케이션 조회 실패:", err);
            });
    }, []);

   if (!detailData) {
        return (
            <div className="workcation-detail-container">
                <h2 align="center">내 워케이션</h2>
                <p align="center" style={{ marginTop: "30px", color: "#666" }}>
                    등록된 워케이션 내역이 없습니다.
                </p>
            </div>
        );
    }

    const {
        workcationNo = "",
        workcationTitle = "",
        startDate = "",
        endDate = "",
        mainRegion = "",
        subRegion = "",
        planList = []
    } = detailData;

   const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteWorkcation(workcationNo);
            alert("삭제가 완료되었습니다.");
            navigate("/workcation/list");
        } catch (err) {
            console.error("삭제 실패 :", err);
            alert("삭제 중 오류 발생");
        }
    };

    const handleOpenModal = (task) => {
        setSelectedTask(task);
        setTaskProgress(task.progress || 0);
        setTaskReport(task.report || "");
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const totalTasks = planList.length;
    const completedTasks = planList.filter(item => (item.progress || 0) === 100).length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="workcation-detail-container">
            <div className="detail-top-nav">
                <h2 align="center">내 워케이션 내용</h2>
                <button className="back-list-btn" onClick={() => navigate('/workcation/list')}>
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
                                onClick={() => handleOpenModal(item)}
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

            <div className="detail-button-area">
                <button type="button" className="delete-workcation-btn" onClick={handleDelete}>
                    워케이션 취소/삭제
                </button>
            </div>

            {selectedTask && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="task-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedTask.taskName}</h3>
                            <button className="modal-close-x" onClick={handleCloseModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section">
                                <label>진행률</label>
                                <div className="modal-progress-bar-bg">
                                    <div className="modal-progress-bar-fill" style={{ width: `${taskProgress}%` }}>
                                        <span>{taskProgress}%</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="change-progress-btn"
                                    onClick={() => {
                                        const newProg = prompt("변경할 진행률(0~100)을 입력하세요:", taskProgress);
                                        if (newProg !== null) setTaskProgress(Math.min(100, Math.max(0, Number(newProg))));
                                    }}
                                >
                                    진행률 변경
                                </button>
                            </div>

                            <div className="modal-section">
                                <label>업무 내용</label>
                                <p className="modal-task-desc">{selectedTask.taskDesc || "등록된 상세 내용이 없습니다."}</p>
                            </div>

                            <div className="modal-section">
                                <label>최근 활동</label>
                                <div className="activity-box">
                                    <span>08/10 09:00 0 → 20%</span>
                                    <span>08/10 15:00 20 → 50%</span>
                                    <span>08/11 14:00 50 → 80%</span>
                                </div>
                            </div>

                            <div className="modal-section">
                                <label>업무 리포트</label>
                                <textarea
                                    value={taskReport}
                                    onChange={(e) => setTaskReport(e.target.value)}
                                    placeholder="업무 진행 상황을 리포트로 작성해주세요."
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="request-complete-btn"
                                onClick={() => {
                                    alert("완료 요청이 전송되었습니다.");
                                    handleCloseModal();
                                }}
                            >
                                완료 요청
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default MyWorkcationFormComponent;