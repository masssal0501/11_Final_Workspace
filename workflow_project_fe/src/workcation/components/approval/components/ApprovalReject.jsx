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
                await ApprovalApi.getApprovalDetail(workcationNo);

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

        return <div>로딩중...</div>;

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


    return (

        <div className="rejectPage">

            <h3>승인 및 반려 페이지</h3>

            <hr />


            {/* 워케이션 제목 */}
            <div>

                <h2 align="center">
                    {workcationInfo.workcationTitle}
                </h2>

            </div>


            <br />
            <br />


            {/* 신청자 */}
            <div align="left">

                <h6>신청자</h6>

                <span>
                    {workcationInfo.employee?.deptName}
                </span>

                &nbsp;

                <span>-</span>

                &nbsp;

                <span>
                    {workcationInfo.employee?.empName}
                </span>

            </div>


            <br />


            {/* 작성 날짜 */}
            <div align="left">

                <h6>작성날짜</h6>

                <span>
                    {workcationInfo.createdAt?.replace("T", " ")}
                </span>

            </div>


            <br />


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


            <br />


            {/* 워케이션 장소 */}
            <div align="left">

                <h6>워케이션 장소</h6>

                <span>
                    {workcationInfo.hub?.hubName}
                </span>

            </div>


            <br />


            {/* 주소 */}
            <div align="left">

                <h6>주소</h6>

                <span>
                    {workcationInfo.hub?.hubAddress}
                </span>

            </div>


            <br />


            {/* 업무 계획 */}
            <div>

                <h5>업무계획</h5>

                <div className="planBox">
                    {workcationInfo.workPlan}
                </div>

            </div>


            <br />


            {/* 상태 */}
            <div>

                <h5>상태</h5>

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

            </div>


            <br />


            {/* 반려 사유 */}
            <div>

                <h5>반려 사유</h5>

                <textarea
                    className="rejectBox"
                    value={approverComment}
                    onChange={(e) =>
                        setApproverComment(e.target.value)
                    }
                    placeholder="반려 사유를 입력해주세요."
                />

            </div>


            <br />


            {/* 현재 상태 */}
            <div>

                <h5>
                    현재 승인 상태 :{" "}
                    {getApprovalStatus(approverState)}
                </h5>

            </div>


            <br />


            {/* 버튼 */}
            <div className="button">

                <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmit}
                >
                    등록하기
                </button>


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

export default ApprovalReject;