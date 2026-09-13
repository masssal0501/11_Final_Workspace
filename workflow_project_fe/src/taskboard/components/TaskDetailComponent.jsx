import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorkcationTasks, updateTaskStatus } from "../api/Task";
import { downloadWorkFile, getWorkFilePreview } from "../../workcation/api/WorkcationApi";

import TaskStatusBadge from "./TaskStatusBadge";

import "../styles/TaskDetail.css";

function TaskDetailComponent() {
    const { workcationNo } = useParams();
    const navigate = useNavigate();
    const loginUser = JSON.parse(localStorage.getItem("user"));

    const [data, setData] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [panelTop, setPanelTop] = useState(120);
    const [rejectTask, setRejectTask] = useState(null);
    const [rejectContent, setRejectContent] = useState("");

    // 첨부파일 썸네일
    const [thumbnailUrls, setThumbnailUrls] = useState([]);

    useEffect(() => {
        selectWorkcationTasks();
    }, [workcationNo]);

    // 첨부 이미지 최대 4개 썸네일 생성
    useEffect(() => {
        if (!data?.taskList) {
            setThumbnailUrls([]);
            return;
        }

        const files = data.taskList
            .flatMap(task => task.fileList || [])
            .filter(
                (file, index, arr) =>
                    arr.findIndex(item => item.taskFileNo === file.taskFileNo) === index
            );

        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originName || ""))
            .slice(0, 4);

        let objectUrls = [];

        const loadThumbnails = async () => {
            try {
                const result = [];

                for (const file of imageFiles) {
                    const blob = await getWorkFilePreview(file.taskFileNo);
                    const url = URL.createObjectURL(blob);

                    objectUrls.push(url);
                    result.push({
                        taskFileNo: file.taskFileNo,
                        originName: file.originName,
                        url
                    });
                }

                setThumbnailUrls(result);
            } catch (error) {
                console.error("첨부파일 썸네일 조회 실패", error);
            }
        };

        loadThumbnails();

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [data]);

    // 조회
    // BUG: 존재하지 않는 workcationNo로 접근하면 에러 상태를 저장하지 않아
    // "불러오는 중입니다" 로딩 화면에서 영원히 멈춰 있었다.
    const selectWorkcationTasks = async () => {
        try {
            setLoadError(false);
            const response = await getWorkcationTasks(workcationNo);
            console.log("업무 상세 응답:", response);
            setData(response);
        } catch (error) {
            console.error("워케이션 업무 조회 실패", error);
            setLoadError(true);
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

    if (loadError) {
        return (
            <main className="wf-container">
                <section className="wf-page-header">
                    <div>
                        <h1 className="wf-page-title">업무 상세</h1>
                    </div>
                </section>
                <div className="wf-state">
                    <div className="wf-state-title">업무 정보를 찾을 수 없습니다.</div>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/task/list")}>
                        목록으로
                    </button>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="wf-container">
                <section className="wf-page-header">
                    <div>
                        <h1 className="wf-page-title">업무 상세</h1>
                    </div>
                </section>
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <div className="wf-state-title">업무 정보를 불러오는 중입니다.</div>
                </div>
            </main>
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

    // 이미지 파일
    const imageFileList = fileList.filter(file =>
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originName || "")
    );

    // 앞의 이미지 4개만 썸네일
    const thumbnailFileIds = new Set(
        imageFileList.slice(0, 4).map(file => file.taskFileNo)
    );

    // 썸네일 제외 파일
    const normalFileList = fileList.filter(
        file => !thumbnailFileIds.has(file.taskFileNo)
    );

    // 긴 파일명 축약 + 확장자 유지
    const getShortFileName = (fileName) => {
        const lastDot = fileName.lastIndexOf(".");

        if (lastDot === -1) {
            return fileName.length > 10
                ? `${fileName.substring(0, 10)}...`
                : fileName;
        }

        const name = fileName.substring(0, lastDot);
        const ext = fileName.substring(lastDot);

        return name.length > 10
            ? `${name.substring(0, 10)}...${ext}`
            : fileName;
    };



    return (
        <main className="wf-container task-detail-page">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">업무 상세</h1>
                    <p className="wf-page-description">워케이션에 등록된 업무의 진행 상황과 첨부파일을 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
                <div className="content-area">

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

                    <table className="wf-table list-area">
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
                                                            className="btn btn-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTaskStatus(task.taskNo, "Y");
                                                            }}
                                                        >
                                                            승인
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
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
                                                    className="btn btn-secondary"
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
        <h4>첨부파일</h4>

        {/* 이미지 최대 4개 */}
        {thumbnailUrls.length > 0 && (
            <div className="work-file-thumbnail-list">
                {thumbnailUrls.map(file => (
                    <div
                        className="work-file-thumbnail-item"
                        key={file.taskFileNo}
                        onClick={() => downloadWorkFile(file.taskFileNo, file.originName)}
                    >
                        <img src={file.url} alt={file.originName} />

                        <div
                            className="thumbnail-file-name"
                            title={file.originName}
                        >
                            {getShortFileName(file.originName)}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* 일반 파일 + 이미지 5번째 이후 */}
        {normalFileList.length > 0 && (
            <div className="non-image-file-list">
                {normalFileList.map(file => (
                    <button
                        type="button"
                        className="admin-file-link"
                        key={file.taskFileNo}
                        title={file.originName}
                        onClick={() =>
                            downloadWorkFile(file.taskFileNo, file.originName)
                        }
                    >
                        {getShortFileName(file.originName)}
                    </button>
                ))}
            </div>
        )}
    </div>
)}




                    {(!data.taskList || data.taskList.length === 0) && (
                        <div className="wf-state">
                            <div className="wf-state-title">등록된 업무가 없습니다.</div>
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

                    <div className="wf-page-actions btn-set">
                        <button
                            type="button"
                            className="btn btn-secondary"
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
                                        className="btn btn-primary"
                                        onClick={handleReject} >
                                        거부
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
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
            </div>
        </main>
    );
}

export default TaskDetailComponent;
