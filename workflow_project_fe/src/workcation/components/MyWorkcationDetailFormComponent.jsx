import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getMyWorkcationDetail,
    deleteWorkcation,
    saveTaskProgress,
    uploadWorkFile,
    getWorkFilePreview,
    deleteWorkFile
} from "../api/WorkcationApi";
import "../styles/MyWorkcationDetail.css";

function MyWorkcationDetailFormComponent() {
    // 페이지 이동 / 파라미터
    const navigate = useNavigate();
    const { workcationNo } = useParams();

    // 상세 데이터
    const [detailData, setDetailData] = useState(null);

    // 업무 모달
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskProgress, setTaskProgress] = useState(0);
    const [taskReportTitle, setTaskReportTitle] = useState("");
    const [taskReportContent, setTaskReportContent] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [activityList, setActivityList] = useState([]);

    // 첨부파일
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [thumbnailUrls, setThumbnailUrls] = useState([]);

    // 내 워케이션 상세 조회
    useEffect(() => {
        getMyWorkcationDetail(workcationNo)
            .then(res => {
                setDetailData(res);
                setActivityList(res.historyList || []);
            })
            .catch(err => {
                console.error("내 워케이션 조회 실패:", err);
            });
    }, [workcationNo]);

    // 이미지 첨부파일 최대 4개 썸네일 생성
    useEffect(() => {
        if (!detailData?.fileList?.length) {
            setThumbnailUrls([]);
            return;
        }

        const imageFiles = detailData.fileList
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
                console.error("썸네일 조회 실패", error);
            }
        };

        loadThumbnails();

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [detailData?.fileList]);

    // 상세 데이터 로딩 전
    if (!detailData) {
        return (
            <main className="wf-container">
                <section className="wf-page-header">
                    <div>
                        <h1 className="wf-page-title">내 워케이션</h1>
                    </div>
                </section>

                <div className="wf-state">
                    <span className="wf-state-title">
                        등록된 워케이션 내역이 없습니다.
                    </span>
                </div>
            </main>
        );
    }

    // 상세 데이터 분리
    const {
        workcationNo: detailWorkcationNo = "",
        workcationTitle = "",
        startDate = "",
        endDate = "",
        mainRegion = "",
        subRegion = "",
        planList = [],
        fileList = [],
        approverState = ""
    } = detailData;

    // BUG-09: 승인된 워케이션이어도 기간(endDate)이 지나면 출근/업무계획/업무보고를
    // 더 이상 수정할 수 없어야 한다 - 백엔드도 동일하게 거부하지만(방어적 이중 검증),
    // 프런트에서도 버튼을 눌러도 소용없다는 것을 미리 보여준다.
    const isPeriodOver = Boolean(endDate) && new Date() > new Date(endDate);

    // 업무 상세 모달 열기
    const openTaskModal = (task) => {
        if (isPeriodOver) {
            alert("워케이션 기간이 종료되어 업무 내용을 수정할 수 없습니다.");
            return;
        }

        setSelectedTask(task);
        setTaskProgress(task.progress ?? 0);
        setTaskReportTitle(task.taskTitle ?? "");
        setTaskReportContent(task.taskContent ?? "");
    };

    // 워케이션 삭제
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

    // 업무 진행률 변경
    const handleProgressChange = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;

        let percent = (x / rect.width) * 100;

        percent = Math.max(0, Math.min(100, percent));
        percent = Math.round(percent / 5) * 5;

        setTaskProgress(percent);
    };

    // 업무 진행상황 저장
    const handleTaskSave = async () => {
        if (isPeriodOver) {
            alert("워케이션 기간이 종료되어 업무 내용을 수정할 수 없습니다.");
            return;
        }

        if (!selectedTask?.taskNo) {
            alert("업무 번호가 없습니다.");
            return;
        }

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
            await saveTaskProgress(requestData);

            alert("업무 진행 상황이 저장되었습니다.");
            setSelectedTask(null);

            const res = await getMyWorkcationDetail(workcationNo);

            setDetailData(res);
            setActivityList(res.historyList || []);
        } catch (error) {
            console.error("업무 저장 실패:", error);
            alert("업무 저장 중 오류가 발생했습니다.");
        }
    };

    // 첨부파일 삭제
    const handleWorkFileDelete = async (taskFileNo) => {
        if (!window.confirm("첨부파일을 삭제하시겠습니까?")) return;

        try {
            await deleteWorkFile(taskFileNo);

            const res = await getMyWorkcationDetail(workcationNo);

            setDetailData(res);
            setActivityList(res.historyList || []);
        } catch (error) {
            console.error("첨부파일 삭제 실패", error);
            alert("첨부파일 삭제에 실패했습니다.");
        }
    };

    // 첨부파일 선택 즉시 업로드
    const handleWorkFileChange = async (e) => {
        if (isPeriodOver) {
            alert("워케이션 기간이 종료되어 첨부파일을 등록할 수 없습니다.");
            e.target.value = "";
            return;
        }

        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxSize = 10 * 1024 * 1024;

        // 10MB 초과 검사
        const oversizedFile = files.find(file => file.size > maxSize);

        if (oversizedFile) {
            alert(`${oversizedFile.name} 파일은 10MB를 초과했습니다.`);
            e.target.value = "";
            return;
        }

        // 이미 등록된 파일명
        const registeredFileNames = new Set(
            fileList.map(file => file.originName)
        );

        // 이번에 선택한 파일끼리도 중복 제거
        const selectedFileNames = new Set();

        const uploadFiles = files.filter(file => {
            if (registeredFileNames.has(file.name)) {
                return false;
            }

            if (selectedFileNames.has(file.name)) {
                return false;
            }

            selectedFileNames.add(file.name);
            return true;
        });

        // 모두 중복이면 업로드하지 않음
        if (uploadFiles.length === 0) {
            alert("이미 등록된 파일입니다.");
            e.target.value = "";
            return;
        }

        // 일부만 중복인 경우 안내
        if (uploadFiles.length !== files.length) {
            alert("중복된 파일은 제외하고 등록합니다.");
        }

        try {
            setIsFileUploading(true);

            for (const file of uploadFiles) {
                await uploadWorkFile(detailWorkcationNo, file);
            }

            const res = await getMyWorkcationDetail(workcationNo);
            setDetailData(res);
            setActivityList(res.historyList || []);
            e.target.value = "";
        } catch (error) {
            console.error("첨부파일 등록 실패", error);
            alert("첨부파일 등록에 실패했습니다.");
        } finally {
            setIsFileUploading(false);
        }
    };

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

    // 전체 업무 진행률 계산
    const totalTasks = planList.length;

    const completedTasks = planList.filter(
        item => (item.progress || 0) === 100
    ).length;

    const overallProgress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // 이미지 파일 전체
    const imageFileList = fileList.filter(file =>
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originName || "")
    );

    // 앞의 이미지 4개만 썸네일 대상
    const thumbnailFileIds = new Set(
        imageFileList
            .slice(0, 4)
            .map(file => file.taskFileNo)
    );

    // 썸네일 4개를 제외한 모든 파일
    // 이미지 5번째 이후도 여기 포함
    const normalFileList = fileList.filter(
        file => !thumbnailFileIds.has(file.taskFileNo)
    );

    return (
        <main className="wf-container my-workcation-detail-container">

            {/* 페이지 상단 */}
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">내 워케이션</h1>
                    <p className="wf-page-description">
                        업무 진행 상황을 기록하고 결과를 관리합니다.
                    </p>
                </div>

                <div className="wf-page-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/workcation/mylist")}
                    >
                        목록으로
                    </button>
                </div>
            </section>

            {/* 워케이션 기본 정보 */}
            <div className="workcation-info-card">
                <div className="info-row-top">
                    <span className="info-title">
                        {workcationTitle || "제목 없음"}
                    </span>

                    <span className="info-date">
                        {startDate} ~ {endDate}
                    </span>
                </div>

                <hr className="info-divider" />

                <div className="info-row-bottom">
                    <span>{mainRegion} {subRegion}</span>
                </div>
            </div>

            {/* 업무 관리 */}
            <div className="task-manage-section">

                <div className="task-manage-header">
                    <h3>내 워케이션 업무</h3>
                </div>

                {/* 전체 진행률 */}
                <div className="progress-overview-box">
                    <div className="progress-title-area">
                        <span>전체 업무 진행률</span>
                    </div>

                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${overallProgress}%` }}
                        >
                            <span className="progress-text">
                                {overallProgress}%
                            </span>
                        </div>
                    </div>

                    <div className="progress-status-text">
                        완료 {completedTasks} / 전체 {totalTasks}

                        <p className="sub-guide-text">
                            체크 표시가 되어야 완료!!
                        </p>
                    </div>
                </div>

                {/* 업무 목록 */}
                <ul className="my-task-list">
                    {planList.map((item, index) => {
                        const progress = item.progress || 0;
                        const isApproved = item.status === "Y";
                        const isRejected = item.status === "R";

                        return (
                            <li
                                className={`my-task-item ${isApproved ? "approved-task" : ""}`}
                                key={item.taskNo || index}
                                onClick={() => openTaskModal(item)}
                            >
                                <div className="task-item-left">
                                    <input
                                        type="checkbox"
                                        checked={isApproved}
                                        readOnly
                                    />

                                    <span>{item.taskName}</span>
                                </div>

                                <div className="task-item-right">
                                    <span
                                        className={`progress-label ${isRejected ? "rejected-task" : ""}`}
                                    >
                                        {progress === 100
                                            ? isRejected
                                                ? "100% 거부"
                                                : "100% 완료"
                                            : progress > 0
                                                ? `${progress}% 진행`
                                                : "0% 대기"}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {/* 첨부파일 */}
                <div className="work-file-area">
                    <h4>첨부파일</h4>

                    {/* 파일 선택 */}
                    <div className="file-upload-row">
                        <label
                            className={`custom-file-upload ${(isFileUploading || isPeriodOver) ? "disabled" : ""}`}
                        >
                            파일 선택

                            <input
                                type="file"
                                multiple
                                onChange={handleWorkFileChange}
                                disabled={isFileUploading || isPeriodOver}
                            />
                        </label>

                        <span className="file-upload-guide">
                            {isFileUploading
                                ? "업로드 중..."
                                : isPeriodOver
                                    ? "워케이션 기간이 종료되어 등록할 수 없습니다."
                                    : "여러 파일 선택 가능"}
                        </span>
                    </div>

                    {/* 이미지 최대 4개 썸네일 */}
                    {thumbnailUrls.length > 0 && (
                        <div className="work-file-thumbnail-list">
                            {thumbnailUrls.map(file => (
                                <div
                                    className="work-file-thumbnail-item"
                                    key={file.taskFileNo}
                                >
                                    <img
                                        src={file.url}
                                        alt={file.originName}
                                    />

                                    <div
                                        className="thumbnail-file-name"
                                        title={file.originName}
                                    >
                                        {getShortFileName(file.originName)}
                                    </div>

                                    <button
                                        type="button"
                                        className="work-file-delete-btn"
                                        onClick={() =>
                                            handleWorkFileDelete(file.taskFileNo)
                                        }
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 썸네일 제외 파일 */}
                    {normalFileList.length > 0 && (
                        <div className="non-image-file-list">
                            {normalFileList.map(file => (
                                <div
                                    className="non-image-file-item"
                                    key={file.taskFileNo}
                                >
                                    <span
                                        className="non-image-file-name"
                                        title={file.originName}
                                    >
                                        {getShortFileName(file.originName)}
                                    </span>

                                    <button
                                        type="button"
                                        className="non-image-file-delete-btn"
                                        onClick={() =>
                                            handleWorkFileDelete(file.taskFileNo)
                                        }
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="my-detail-button-area">
                {approverState === "A" && (
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                            navigate(`/survey/${detailWorkcationNo}`)
                        }
                    >
                        만족도 조사 작성
                    </button>
                )}
                {/* TODO-N02: 만족도 조사와 별개의 워케이션 후기(별점+후기글+사진) 기능.
                    작성 가능 여부/기작성 여부는 WorkcationReviewForm 진입 후 판단한다
                    (만족도 조사 버튼과 동일한 방식 - approverState==="A"일 때만 노출). */}
                {approverState === "A" && (
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/workcation/${detailWorkcationNo}/review`)}
                    >
                        워케이션 후기 작성
                    </button>
                )}
                {/* BUG: 상태와 무관하게 취소/삭제 버튼이 항상 노출되어, 이미 승인(A)되어
                    업무가 진행 중이거나 이미 취소(C)된 건까지 다시 삭제할 수 있었다.
                    아직 승인이 확정되지 않았거나(대기/보류/검토) 반려된 건만 취소/삭제 가능. */}
                {["W", "H", "R", "J"].includes(approverState) && (
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleDelete}
                    >
                        워케이션 취소/삭제
                    </button>
                )}
            </div>

            {/* 업무 상세 모달 */}
            {selectedTask && (
                <div className="task-modal-overlay">
                    <div className="task-modal-box">

                        {/* 모달 제목 */}
                        <div className="task-modal-header">
                            <h2>{selectedTask.taskTitle}</h2>

                            <button
                                type="button"
                                aria-label="닫기"
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
                                onMouseUp={() =>
                                    setIsDragging(false)
                                }
                                onMouseLeave={() =>
                                    setIsDragging(false)
                                }
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

                            {activityList.filter(
                                activity =>
                                    activity.taskNo === selectedTask.taskNo
                            ).length === 0 ? (
                                <p>
                                    등록된 최근 활동이 없습니다.
                                </p>
                            ) : (
                                <div className="activity-list">
                                    {activityList
                                        .filter(
                                            activity =>
                                                activity.taskNo === selectedTask.taskNo
                                        )
                                        .map(activity => (
                                            <div
                                                key={activity.historyNo}
                                                className="activity-item"
                                            >
                                                <span>
                                                    {activity.title}
                                                </span>

                                                <span>
                                                    {activity.createdAt}
                                                </span>

                                                <span>
                                                    {activity.progress}% 진행
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
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

                        {/* 모달 버튼 */}
                        <div className="task-modal-buttons">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedTask(null)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleTaskSave}
                                disabled={isPeriodOver}
                            >
                                저장
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </main>
    );
}

export default MyWorkcationDetailFormComponent;