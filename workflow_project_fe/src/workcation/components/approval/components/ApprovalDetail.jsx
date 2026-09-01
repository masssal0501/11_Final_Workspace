import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "../styles/WorkcationDetail.css";

function ApprovalDetail() {
    // URL 쿼리스트링이나 경로에서 상세 조회를 위한 ID 파라미터 추출 (예: ?no=1)
    const [searchParams] = useSearchParams();
    const workcationNo = searchParams.get("no");
    const navigate = useNavigate();

    // 상세 데이터 저장을 위한 state
    const [detailData, setDetailData] = useState(null);

    // 상세 조회 API 호출
    useEffect(() => {
        if (!workcationNo) return;

        axios.get(`http://localhost:8006/api/approval/detail?no=${workcationNo}`)
            .then(res => {
                setDetailData(res.data);
            })
            .catch(err => {
                console.error("워케이션 상세 조회 실패:", err);
            });
    }, [workcationNo]);

    // 데이터가 로딩 중일 때 처리
    if (!detailData) {
        return <div className="workcatrion-enroll-container"><h2 align="center">로딩 중...</h2></div>;
    }

    // 렌더링에 필요한 값 추출 (API 응답 구조에 맞게 커스텀 가능)
    const {
        startDate = "",
        endDate = "",
        peopleCount = 1,
        purpose = "",
        region = "",
        placeType = "office", // "office" 또는 "accommodation"
        placeName = "",
        address = "",
        planList = [],
        trafficFee = 0,
        etcFee = 0,
        optionsPrice = 0,
        hubPrice = 0,
    } = detailData;

    // 비용 및 지원금 계산
    const totalCost = hubPrice + optionsPrice + Number(trafficFee) + Number(etcFee);
    const hubSupport = placeType === "office" ? hubPrice : Math.min(hubPrice, 200000);
    const programSupport = Math.min(optionsPrice, 300000);
    const totalSupport = hubSupport + programSupport;
    const personalCost = Math.max(0, totalCost - totalSupport);

    return (
        <div className="workcatrion-enroll-container">
            <h2 align="center">워케이션 승인 상세 조회</h2>
            <table className="workcation-form-table">
                <tbody>
                    <tr>
                        <th>신청기간</th>
                        <td style={{ width: "300px" }}>
                            <span>{startDate}</span> ~ <span>{endDate}</span>
                        </td>
                        <th>신청인원</th>
                        <td style={{ width: "200px" }}>
                            <span>{peopleCount}</span> 명
                        </td>
                    </tr>
                    <tr>
                        <th>근무 목적</th>
                        <td>
                            <p className="read-only-box">{purpose}</p>
                        </td>
                        <th>지역</th>
                        <td>
                            {region || "선택한 지역 없음"}
                        </td>
                    </tr>
                    
                    {/* 거점 유형선택 */}
                    <tr>
                        <th>거점 유형</th>
                        <td>
                            <label className="radio-btn">
                                <input type="radio" checked={placeType === "office"} disabled />
                                공유오피스
                            </label>
                            <label className="radio-btn">
                                <input type="radio" checked={placeType === "accommodation"} disabled />
                                숙소
                            </label>
                        </td>
                        <th>위치 주소</th>
                        <td>
                            {address || "현 위치 정보 없음"}
                        </td>
                    </tr>

                    {/* 선택된 유형 드롭다운 (상세보기에선 읽기 전용 텍스트 또는 고정 표시) */}
                    <tr>
                        <th>{placeType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                        <td>
                            <div className="read-only-select-box">
                                {placeName || "선택된 거점 없음"}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 업무 계획 영역 */}
            <div className="task-plan-container">
                <h3 align="center">업무 계획</h3>
                <div className="task-paln-input">
                    <ul className="task-plan-list">
                        {planList.map((item, index) => (
                            <li className="plan-item" key={item.id || index}>
                                <span>{item.taskName} &ensp; {item.days}일</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 비용 합계 영역 */}
            <div className="all-price-container">
                <div className="left-price-box">
                    <h3>지출 내역</h3>
                    <div className="left-price-row">
                        <span>{placeType === "office" ? "오피스 이용료" : "숙박비"}</span>
                        <span>{Number(hubPrice).toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>프로그램 활동비</span>
                        <span>{Number(optionsPrice).toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>교통비</span>
                        <span>{Number(trafficFee).toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>기타</span>
                        <span>{Number(etcFee).toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div className="left-price-input total">
                        <span>예상 총액</span>
                        <strong>{totalCost.toLocaleString()}원</strong>
                    </div>
                </div>

                {/* 지원사업 정보 영역 */}
                <div className="left-price-box">
                    <h3>지원금 혜택</h3>
                    <div className="right-price-row">
                        <span>{placeType === "office" ? "오피스 지원" : "숙박비 지원"}</span>
                        <span>{hubSupport.toLocaleString()}원</span>
                    </div>
                    <div className="right-price-row">
                        <span>체험비 지원</span>
                        <span>최대 {programSupport.toLocaleString()}원</span>
                    </div>
                    <div className="right-price-row total">
                        <span>지원금 합계</span>
                        <span>{totalSupport.toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div>
                        <span>회사/개인부담금</span>
                        <strong>{personalCost.toLocaleString()}원</strong>
                    </div>
                </div>
            </div>

            {/* 승인 버튼 */}
            <div className="btn-group" style={{ textAlign: "center", marginTop: "20px" }}>
                <button type="submit" className="submit-btn" onClick={() => navigate()}>
                    승인
                </button>
            </div>
            {/* 반려 버튼 */}
            <div className="btn-group" style={{ textAlign: "center", marginTop: "20px" }}>
                <button type="button" className="reject-btn" onClick={() => navigate(/approval/reject/{workcationNo})}>
                    반려
                </button>
            </div>

            {/* 목록 버튼 */}
            <div className="btn-group" style={{ textAlign: "center", marginTop: "20px" }}>
                <button type="button" className="back-btn" onClick={() => navigate(-1)}>
                    목록
                </button>
            </div>
        </div>
    );
}

export default ApprovalDetail; 