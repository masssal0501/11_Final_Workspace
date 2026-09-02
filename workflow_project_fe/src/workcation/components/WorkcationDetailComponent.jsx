import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/WorkcationDetail.css";

function WorkcationDetailComponent() {

    //BASE_URL 생성
    const BASE_URL = 'http://localhost:8006/workflow';

    // URL 쿼리스트링이나 경로에서 상세 조회를 위한 ID 파라미터 추출 (예: ?no=1)
    const { workcationNo } = useParams();
    const navigate = useNavigate();

    // 상세 데이터 저장을 위한 state
    const [detailData, setDetailData] = useState(null);

    // 상세 조회 API 호출
    useEffect(() => {
        if (!workcationNo) return;

        axios.get(`${BASE_URL}/workcation/detail/${workcationNo}`)
            .then(res => {
                setDetailData(res.data);
            })
            .catch(err => {
                console.error("워케이션 상세 조회 실패:", err);
            });
    }, [workcationNo]);

    // 데이터가 로딩 중일 때 처리
    if (!detailData) {
        return <div className="workcatrion-detatil-container">
            <h2 align="center">신청 내역</h2>
        </div>;
    }

    // 렌더링에 필요한 값 추출 (API 응답 구조에 맞게 커스텀 가능)
    const {
        startDate = "",
        endDate = "",
        peopleCount = 1,
        purpose = "",
        mainRegion = "",
        subRegion = "",
        placeType = "office", // "office" 또는 "accommodation"
        hubName = "",
        hubAddress = "",
        hubPrice = 0,
        optionPrice = 0,
        transportText = 0,
        etcText = 0,
        totalCost = 0,
        companySupport = 0,
        localGovSupport = 0,
        totalSupport = 0,
        personalCost = 0,
        planList = [],
        option = []
    } = detailData;
    console.log("현재 workcationNo:", workcationNo);

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try{
            await axios.delete(`${BASE_URL}/workcation/delete/${workcationNo}`);
            alert("삭제가 완료되었습니다.");
            navigate("/workcation/list");
        }catch(err){
            console.error("삭제 실패 :", err);
            alert("삭제 중 오류 발생");
        }
    }
/*
    const handleUpdate = async ()=>{
        
    }*/

    return (
        <div className="workcatrion-datail-container">
            <h2 align="center">워케이션 상세 조회</h2>

            <div className="common-btn-group">
                <button
                    type="button"
                    className="back-space"
                    onClick={() => navigate('/workcation/list')}>
                    뒤로가기
                </button>
            </div>

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
                            <div className="read-only">
                                {purpose || "등록 된 목적이 없습니다."}
                            </div>
                        </td>
                        <th>지역</th>
                        <td>
                            <span>{mainRegion} {subRegion} </span>
                        </td>
                    </tr>

                    {/* 거점 유형선택 */}
                    <tr>
                        <th>거점 유형</th>
                        <td>
                            <label className="radio-btn">
                                <input type="radio"
                                    checked={placeType === "office"}
                                    disabled />
                                공유오피스
                            </label>
                            <label className="radio-btn">
                                <input type="radio"
                                    checked={placeType === "accommodation"} disabled />
                                숙소
                            </label>
                        </td>
                        <th>위치 주소</th>
                        <td>
                            {hubAddress || "주소 위치 정보 없음"}
                        </td>
                    </tr>

                    {/* 선택된 유형 드롭다운 (상세보기에선 읽기 전용 텍스트 또는 고정 표시) */}
                    <tr>
                        <th>{placeType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                        <td colSpan={3}>
                            <span>{hubName || "선택된 장소 없음"}</span>
                        </td>
                    </tr>

                    {option && option.map((opt, index) => (
                        <tr key={index} >
                            <th>{opt.type === `program`
                                ? '체험 프로그램' : opt.type === 'restaurant' ? '맛집' : '관광지'}</th>
                            <td>
                                <span>{opt.hubName || "장소 명 없음"}</span>
                            </td>
                            <th>방문일</th>
                            <td>
                                <span>{opt.visitDate || "-"}</span>
                            </td>
                        </tr>
                    ))}
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
                        <span>{Number(optionPrice).toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>교통비</span>
                        <span>{Number(transportText).toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>기타</span>
                        <span>{Number(etcText).toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div className="left-price-input total">
                        <span>예상 총액</span>
                        <strong>{Number(totalCost).toLocaleString()}원</strong>
                    </div>
                </div>

                {/* 지원사업 정보 영역 */}
                <div className="left-price-box">
                    <h3>지원금 혜택</h3>
                    <div className="right-price-row">
                        <span>회사지원금</span>
                        <span>{Number(companySupport).toLocaleString()}원</span>
                    </div>
                    <div className="right-price-row">
                        <span>지자체 지원금</span>
                        <span>{Number(localGovSupport).toLocaleString()}원</span>
                    </div>
                    <div className="right-price-row total">
                        <span>총 지원금 합계</span>
                        <span>{Number(totalSupport).toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div>
                        <span>최종 개인 부담금</span>
                        <strong>{Number(personalCost).toLocaleString()}원</strong>
                    </div>
                </div>
            </div>
            <div>
               <button type="button" >
                    수정
                </button>
                <button type="button" onClick={handleDelete}>
                    삭제
                </button>
            </div>
        </div>
    );
}

export default WorkcationDetailComponent; 