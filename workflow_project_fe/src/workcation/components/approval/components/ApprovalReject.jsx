import { useParams } from "react-router-dom";

import "../style/ApprovalReject.css";

function ApprovalReject() {

    const { workcationNo } = useParams();

    const navigate = useNacigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.authCode === "ADMIN" || "MANAGER";

    // 워케이션 신청 상세 내역
    const selectApprovalDetail = async() => {
        try {
            const response = await ApprovalApi.getApprovalDetail(workcationNo);

            console.log("상세조회 데이터 :", response);

            selectDuplicateDomain(response);
        } catch (error) {
            console.log("워케이션 신청 상세 내역 조회 실패", error);
        }
    };

    
    return (
        <div className="rejectPage">
            <h2>반려 페이지</h2>
            <hr />
            <div>
                <h5 align="center">{workcationTitle}</h5>
            </div>
            <br />
            <div>
                <h5 align="left">{emp_no}</h5>
            </div>
            <br />
            <div>
                <h5 align="left">{createdAt}</h5>
            </div>
            <br />
            <div>
                <h5 align="left">{startAt}</h5> &nbsp;
                <h5 align="left">{endAt}</h5>
            </div>
            <br />
            <div>
                <h4>업무계획</h4><br />
                {workPlan}
            </div>
            <br />
            <div>
                <select name="approvalState"
                value={approvalState} 
                id="approvalState">
                    <option value="W">대기</option>
                    <option value="H">보류</option>
                    <option value="R">검토</option>
                    <option value="J">반려</option>
                </select>
            </div>
            <br />
            <div>
                <textarea name="" id="">{approvalComment}</textarea>
            </div>

            <div>
                <button type="submit" className="submit-btn">
                    등록하기
                </button>
            </div>

            <div>
                <button type="button" className="back-btn" onClick={() => navigate(-1)}>
                    이전으로
                </button>
            </div>

        </div>
    );
}
export default ApprovalReject;