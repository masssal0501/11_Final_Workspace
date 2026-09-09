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
            setApproverState(response.approverState);
            setApproverComment(response.approverComment || "");

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
        return <div>로딩중...</div>;
    }


    return (
        <div className="historyDetailPage">

            <h3>승인 이력 상세</h3>

            <hr />

            <div>
                <h2 align="center">
                    {workcationInfo.workcationTitle}
                </h2>
            </div>
            <br />

            {/* 워케이션 기간 */}
            <div className="workcation-period">

                <h6>워케이션 기간</h6>

                <div className="period-content">

                    <span>
                        {workcationInfo.startAt?.replace("T", " ") || "-"}
                    </span>

                    <span>~</span>

                    <span>
                        {workcationInfo.endAt?.replace("T", " ") || "-"}
                    </span>

                </div>

            </div>

            <br />



            <br />


            <div align="left">
                <h6>신청자</h6>

                <span>
                    {workcationInfo.employee?.deptTitle ||
                    workcationInfo.employee?.depId ||
                    "-"}
                </span>

                &nbsp;-&nbsp;

                <span>
                    {workcationInfo.employee?.empName || "-"}
                </span>
            </div>

            <br />


            {/* 작성 날짜 */}
            <div align="left">

                <h6>작성 날짜</h6>

                <span>
                    {workcationInfo.createdAt?.replace("T", " ") || "-"}
                </span>

            </div>

            <br />
            <br />

            <div align="left">
                <h6>승인자</h6>

                {workcationInfo.approver ? (
                    <>
                        <span>
                            {workcationInfo.approver?.deptTitle ||
                            workcationInfo.approver?.depId ||
                            "-"}
                        </span>

                        &nbsp;-&nbsp;

                        <span>
                            {workcationInfo.approver?.empName || "-"}
                        </span>
                    </>
                ) : (
                    <span>승인자 없음</span>
                )}
            </div>


            <br />

            <div>
                <h6>승인 일시</h6>
                <span>
                    {workcationInfo.approvetAt?.replace("T", " ") || "-"}
                </span>
            </div>

            <br />

            {/* 업무 계획 */}
            <div>

                <h5>업무 계획</h5>


                <div className="historyPlanBox">
                    {workcationInfo.workPlan || "-"}

                </div>

            </div>


            <br />


            {/* 반려 사유 */}
            {workcationInfo.approverComment && (

                <div>

                    <h5>반려 사유</h5>

                    <div className="historyPlanBox">
                        {workcationInfo.approverComment}
                    </div>

                </div>

            )}


            <br />


            <div align="right">

                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    이전으로
                </button>

            </div>

        </div>
    );
}

export default ApprovalHistoryDetail;