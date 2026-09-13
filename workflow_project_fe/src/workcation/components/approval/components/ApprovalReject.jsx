import { useParams, useNavigate } from "react-router-dom";

import "../style/ApprovalReject.css";
import { useEffect, useState } from "react";

import { ApprovalApi } from "../api/ApprovalApi";

function ApprovalReject() {

    const { workcationNo } = useParams();

    const navigate = useNavigate();

    const [workcationInfo, setWorkcationInfo] = useState(null);

    const [approverState, setApproverState] = useState("W");

    const [approverComment, setApproverComment] = useState("");


    // 로그인 사용자 정보
    const user = JSON.parse(localStorage.getItem("user"));

    const isAdmin =
        user?.authCode === "ADMIN" ||
        user?.authCode === "MANAGER";


    // 워케이션 신청 상세 내역 조회
    const selectApprovalDetail = async () => {

        try {

            console.log("상세조회 요청 URL :", `/approval/${workcationNo}`);

            const response =
                await ApprovalApi.getApprovalQueueDetail(workcationNo);

            console.log("상세조회 응답 :", response);

            setWorkcationInfo(response);

            setApproverState(
                response.approverState || "W"
            );

            setApproverComment(
                response.approverComment || ""
            );

        } catch (error) {

            console.error("상세조회 실패 :", error);
            console.error("HTTP 상태 :", error.response?.status);
            console.error("서버 응답 :", error.response?.data);

        }

    };


    // 승인 / 반려 등록
    const handleSubmit = async () => {

        // 반려인데 사유가 없는 경우
        if (
            approverState === "J" &&
            !approverComment.trim()
        ) {

            alert("반려 사유를 입력해주세요.");

            return;
        }


        try {

            const workcation = {

                ...workcationInfo,

                workcationNo: Number(workcationNo),

                approverState: approverState,

                approverComment: approverComment

            };


            console.log(
                "승인 / 반려 등록 데이터 :",
                workcation
            );


            const response =
                await ApprovalApi.rejectApproval(
                    workcationNo,
                    workcation
                );


            console.log(
                "승인 / 반려 등록 결과 :",
                response
            );


            if (response === "success") {

                alert("승인 상태가 등록되었습니다.");

                navigate(-1);

            } else {

                alert("등록에 실패했습니다.");

            }

        } catch (error) {

            console.error(
                "승인 / 반려 등록 실패 :",
                error
            );

            alert("승인 상태 등록 중 오류가 발생했습니다.");

        }

    };


    // 상세 조회
    useEffect(() => {

        console.log("현재 workcationNo :", workcationNo);

        selectApprovalDetail();

    }, [workcationNo]);


    // 로딩
    if (!workcationInfo) {

        return (
            <main className="wf-container">
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <span className="wf-state-title">신청 내역을 불러오는 중입니다.</span>
                </div>
            </main>
        );

    }


    // 승인 상태 표시
    const getApprovalStatus = (approvalState) => {

        if (approvalState === "W") {
            return "대기";
        }

        if (approvalState === "H") {
            return "보류";
        }

        if (approvalState === "R") {
            return "검토";
        }

        if (approvalState === "J") {
            return "반려";
        }

        if (approvalState === "A") {
            return "승인";
        }

        return "알 수 없음";

    };

    // 상태 배지 색상(표시 전용)
    const getStatusTone = (state) => {
        switch (state) {
            case "A": return "wf-badge-success";
            case "J": return "wf-badge-danger";
            case "H": return "wf-badge-neutral";
            case "R": return "wf-badge-info";
            case "W":
            default: return "wf-badge-warning";
        }
    };


    return (

        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">승인 및 반려</h1>
                    <p className="wf-page-description">{workcationInfo.workcationTitle}</p>
                </div>
                <div className="wf-page-actions">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        이전으로
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={handleSubmit}
                    >
                        등록하기
                    </button>
                </div>
            </section>

            <div className="rejectPage">

            {/* 신청자 / 작성날짜 / 워케이션 기간 */}
            <div align="left">

                        <h6>신청자</h6>
                        <span>
                            {workcationInfo.employee?.deptTitle ||
                            workcationInfo.employee?.depId ||
                            "-"}
                            &nbsp;-&nbsp;
                            {workcationInfo.employee?.empName || "-"}
                        </span>

            </div>


            {/* 작성 날짜 */}
            <div align="left">

                <h6>작성날짜</h6>

                <span>
                    {workcationInfo.createdAt?.replace("T", " ")}
                </span>

            </div>


            {/* 워케이션 기간 */}
            <div align="left">

                <h6>워케이션 기간</h6>

                <span>
                    {workcationInfo.startAt?.replace("T", " ")}
                </span>

                &nbsp;

                <span>~</span>

                &nbsp;

                <span>
                    {workcationInfo.endAt?.replace("T", " ")}
                </span>

            </div>


            {/* 워케이션 장소 */}
            <div align="left">

                <h6>워케이션 장소</h6>

                <span>
                    {workcationInfo.hub?.hubName}
                </span>

            </div>


            {/* 주소 */}
            <div align="left">

                <h6>주소</h6>

                <span>
                    {workcationInfo.hub?.hubAddress}
                </span>

            </div>


            {/* 업무 계획 */}
            <div>

                <h5>업무계획</h5>

                <div className="planBox">
                    {workcationInfo.workPlan}
                </div>

            </div>


            {/* 상태 */}
            <div>

                <h5>상태 처리<span className="wf-required">*</span></h5>

                <select
                    name="approverState"
                    value={approverState}
                    onChange={(e) =>
                        setApproverState(e.target.value)
                    }
                    id="approverState"
                >

                    <option value="W">
                        대기
                    </option>

                    <option value="H">
                        보류
                    </option>

                    <option value="R">
                        검토
                    </option>

                    <option value="J">
                        반려
                    </option>

                    <option value="A">
                        승인
                    </option>


                </select>

                {" "}
                <span className={`wf-badge ${getStatusTone(approverState)}`}>
                    현재 선택: {getApprovalStatus(approverState)}
                </span>

            </div>


            {/* 반려 사유 */}
            <div>

                <h5>
                    반려 사유
                    {approverState === "J" && <span className="wf-required">*</span>}
                </h5>

                <textarea
                    className="rejectBox"
                    value={approverComment}
                    onChange={(e) =>
                        setApproverComment(e.target.value)
                    }
                    placeholder="반려 사유를 입력해주세요."
                />
                {approverState === "J" && !approverComment.trim() && (
                    <p className="wf-error-text">반려 처리 시 사유 입력은 필수입니다.</p>
                )}

            </div>

            </div>

        </main>

    );

}

export default ApprovalReject;