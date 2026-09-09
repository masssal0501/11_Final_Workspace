import { useParams, useNavigate } from "react-router-dom";

import "../style/ApprovalHistoryDetail.css";
import { useEffect, useState } from "react";

import { ApprovalApi } from "../api/ApprovalApi";

function ApprovalHistoryDetail() {

    const { workcationNo } = useParams();

    const navigate = useNavigate();

    const [workcationInfo, setWorkcationInfo] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));

    // 워케이션 신청 상세 내역
    const selectApprovalDetail = async () => {
        try {

            const response =
                await ApprovalApi.getApprovalDetail(workcationNo);

            console.log("상세조회 데이터 :", response);

            setWorkcationInfo(response);

        } catch (error) {

            console.log(
                "워케이션 신청 상세 내역 조회 실패",
                error
            );
        }
    };

    useEffect(() => {
        selectApprovalDetail();
    }, [workcationNo]);


    if (!workcationInfo) {
        return (
            <main className="wf-container">
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <span className="wf-state-title">승인 이력을 불러오는 중입니다.</span>
                </div>
            </main>
        );
    }


    return (
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">승인 이력 상세</h1>
                    <p className="wf-page-description">{workcationInfo.workcationTitle}</p>
                </div>
                <div className="wf-page-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        이전으로
                    </button>
                </div>
            </section>

            <div className="historyDetailPage">

                {/* 핵심 정보: 기간 / 신청자 / 승인자 / 승인 일시 */}
                <div className="info-row-group">
                    <div>
                        <h6>워케이션 기간</h6>
                        <span>
                            {workcationInfo.startAt?.replace("T", " ") || "-"}
                            {" ~ "}
                            {workcationInfo.endAt?.replace("T", " ") || "-"}
                        </span>
                    </div>

                    <div>
                        <h6>신청자</h6>
                        <span>
                            {workcationInfo.employee?.deptTitle ||
                            workcationInfo.employee?.depId ||
                            "-"}
                            &nbsp;-&nbsp;
                            {workcationInfo.employee?.empName || "-"}
                        </span>
                    </div>

                    <div>
                        <h6>작성 날짜</h6>
                        <span>
                            {workcationInfo.createdAt?.replace("T", " ") || "-"}
                        </span>
                    </div>
                </div>

                <div className="info-row-group">
                    <div>
                        <h6>승인자</h6>
                        {workcationInfo.approver ? (
                            <span>
                                {workcationInfo.approver?.deptTitle ||
                                workcationInfo.approver?.depId ||
                                "-"}
                                &nbsp;-&nbsp;
                                {workcationInfo.approver?.empName || "-"}
                            </span>
                        ) : (
                            <span>승인자 없음</span>
                        )}
                    </div>

                    <div>
                        <h6>승인 일시</h6>
                        <span>
                            {workcationInfo.approvetAt?.replace("T", " ") || "-"}
                        </span>
                    </div>
                </div>

                {/* 업무 계획 */}
                <div className="info-row">
                    <h5>업무 계획</h5>
                    <div className="historyPlanBox">
                        {workcationInfo.workPlan || "-"}
                    </div>
                </div>

                {/* 반려 사유 */}
                {workcationInfo.approverComment && (
                    <div className="info-row">
                        <h5>반려 사유</h5>
                        <div className="historyPlanBox">
                            {workcationInfo.approverComment}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default ApprovalHistoryDetail;