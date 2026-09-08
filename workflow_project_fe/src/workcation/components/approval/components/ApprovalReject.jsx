import { useParams, useNavigate } from "react-router-dom";

import "../style/ApprovalReject.css";
import { useEffect, useState } from "react";

import axiosInstance from "../../../../common/api/axiosInstance";

function ApprovalReject() {

    const { workcationNo } = useParams();

    const navigate = useNavigate();

    const [workcationInfo, setWorkcationInfo ] = useState(null);

    // const [workcationInfo, setWorkcationInfo] = useState({
    //     workcationTitle: "제주 워케이션",
    //     workPlan: "제주 지역에서 원격 근무를 진행하며 업무를 수행합니다.",
    //     createdAt: "2026-09-01",
    //     startAt: "2026-09-10",
    //     endAt: "2026-09-15",
    //     approverState: "W",
    //     approverComment: "",

    //     employee: {
    //         empNo: 10,
    //         empName: "김규민",
    //         deptName: "개발부"
    //     },

    //     hub: {
    //         hubName: "제주 워케이션 센터",
    //         hubAddress: "제주특별자치도 제주시 제주대로 123"
    //     }
    // });

    const [approverState, setApproverState] = useState("W");
    const [approverComment, setApproverComment] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin =
    user?.authCode === "ADMIN" ||
    user?.authCode === "MANAGER";

    // 워케이션 신청 상세 내역
    const selectApprovalDetail = async() => {
        try {
            const response = await ApprovalApi.getApprovalDetail(workcationNo);

            console.log("상세조회 데이터 :", response);

            setWorkcationInfo(response);
            setApproverState(response.approverState);
            setApproverComment(response.approverComment || "");
        } catch (error) {
            console.log("워케이션 신청 상세 내역 조회 실패", error);
        }
    };
    useEffect(() => {
    selectApprovalDetail();
    }, [workcationNo]);

    if(!workcationInfo) {

        return <div>로딩중...</div>
    }

    // 승인 상태 표시
    const getApprovalStatus = (approvalState) => {
        if (approvalState === "W"){
            return "대기"
        }
            if (approvalState === "H"){
            return "보류"
        }
            if (approvalState === "R"){
            return "검토"
        }
            if (approvalState === "J"){
            return "반려"
        }
    };

    
    return (
        <div className="rejectPage">
            <h3>승인 및 반려 페이지</h3>
            <hr />
        <div>
            <h2 align="center">
                {workcationInfo.workcationTitle}
            </h2>
        </div>

        <br />
        <br />

        <div align="left">
            <h6>신청자 </h6>
            <h7>
                {workcationInfo.employee?.deptName}
            </h7>
            &nbsp;
            <h7>-</h7>
            &nbsp;
            <h7>
                {workcationInfo.employee?.empName}
            </h7>
        </div>

        <br />


        <div align="left"> 
            <h6>작성날짜 </h6>
            <h7 align="left">
                {workcationInfo.createdAt}
            </h7>
        </div>

        <br />

        <div align="left">
            <h6>워케이션 기간 </h6>
            <h7 align="left">
                {workcationInfo.startAt}
            </h7>
            <h7>~</h7>
            <h7 align="left">
                {workcationInfo.endAt}
            </h7>
        </div>

        <br />

        <div align="left">
            <h6>워케이션 장소 </h6>
            <h7>
                {workcationInfo.hub?.hubName}
            </h7>
        </div>

        <br />

        <div align="left">
            <h6>주소 </h6>
            <h7>
                {workcationInfo.hub?.hubAddress}
            </h7>
        </div>

        <br />

        <div>
            <h5>업무계획</h5>
            <div className="planBox">
            {workcationInfo.workPlan}
            </div>
        </div>
            <br />
            <div>
                <h5>상태</h5>
            <select
                name="approverState"
                value={approverState}
                onChange={(e) => setApproverState(e.target.value)}
                id="approverState"
            />
            </div>
            <br />
            <div>
                <h5>반려 사유</h5>
                <textarea className="rejectBox"
                value={approverComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                />
            </div>

            <br />

            <div align="right">
                <button type="submit" className="submit-btn">
                    등록하기
                </button>

                &nbsp;&nbsp;

                <button type="button" className="back-btn" onClick={() => navigate(-1)}>
                    이전으로
                </button>
            </div>

        </div>
    );
}
export default ApprovalReject;