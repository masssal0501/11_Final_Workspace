import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getWorkcationDetail, deleteWorkcation } from "../api/WorkcationApi";

import "../styles/WorkcationDetail.css";

function ApprovalQueueDetail() {

    const { workcationNo } = useParams();
    const navigate = useNavigate();

    const [detailData, setDetailData] = useState(null);

    useEffect(() => {
        if (!workcationNo) return;

        getWorkcationDetail(workcationNo)
            .then(res => {
                setDetailData(res);
            })
            .catch(err => {
                console.error("워케이션 상세 조회 실패:", err);
            });
    }, [workcationNo]);

    if (!detailData) {
        return <div className="workcation-detail-container">
            <h2 align="center">신청 내역</h2>
        </div>;
    }

    const {
        workcationTitle = "",
        startDate = "",
        endDate = "",
        peopleCount = 1,
        purpose = "",
        mainRegion = "",
        subRegion = "",
        placeType = "office",
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

    const handleUpdate = async () => {
        navigate(`/workcation/update/${workcationNo}`);
    }

    return (
        <div className="workcation-detail-container">
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
                        <th>워케이션 제목</th>
                        <td colSpan={3}>
                            <input
                                type="text"
                                value={workcationTitle || ""}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>신청기간</th>
                        <td colSpan={3}>
                            <div className="cell-box">
                                <span>{startDate}</span> ~ <span>{endDate}</span>
                            </div>
                        </td>
                        <th>신청현황</th>
                        <td>
                            <div className="cell-box status-cell-box">
                                <span className="status-badge">신청 완료</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>근무 목적</th>
                        <td colSpan={5}>
                            <div className="cell-box">
                                {purpose || "등록 된 목적이 없습니다."}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>지역</th>
                        <td style={{ width: "190px" }}>
                            <div className="cell-box">
                                <span>{mainRegion} {subRegion} </span>
                            </div>
                        </td>
                        <th>거점 유형</th>
                        <td style={{ width: "320px" }}>
                            <div className="cell-box radio-group-box">
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
                            </div>
                        </td>
                        <th>신청인원</th>
                        <td style={{ width: "110px" }}>
                            <div className="cell-box">
                                <span>{peopleCount}</span> 명
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th>{placeType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                        <td>
                            <div className="cell-box">
                                <span>{hubName || "선택된 장소 없음"}</span>
                            </div>
                        </td>
                        <th>위치 주소</th>
                        <td colSpan={3}>
                            <div className="cell-box">
                                {hubAddress || "주소 위치 정보 없음"}
                            </div>
                        </td>
                    </tr>

                    {option && option.map((opt, index) => (
                        <tr key={index} >
                            <th>{opt.type === `program`
                                ? '프로그램' : opt.type === 'restaurant' ? '맛집' : '관광지'}</th>
                            <td colSpan={2}>
                                <div className="cell-box">
                                    <span>{opt.hubName || "장소 명 없음"}</span>
                                </div>
                            </td>
                            <th>방문일</th>
                            <td colSpan={2}>
                                <div className="cell-box">
                                    <span>{opt.visitDate || "-"}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="task-plan-container">
                <h3 className="task-plan-title">업무 계획</h3>
                <div className="task-plan-split-container">
                    <div className="task-plan-box">
                        <ul className="task-plan-list">
                            {planList.map((item, index) => (
                                <li className="task-item-row" key={item.id || index}>
                                    <span className="task-name">{item.taskName}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="task-plan-box right-box">
                        <ul className="task-plan-list">
                            {planList.map((item, index) => (
                                <li className="task-item-row" key={item.id || index}>
                                    <span className="task-days">{item.days}일</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="all-price-container">
                <div className="price-box-sync">
                    <div>
                        <h3>지출 내역</h3>
                        <div className="price-row-sync">
                            <span>{placeType === "office" ? "오피스 이용료" : "숙박비"}</span>
                            <span>{Number(hubPrice).toLocaleString()}원</span>
                        </div>
                        <div className="price-row-sync">
                            <span>프로그램 활동비</span>
                            <span>{Number(optionPrice).toLocaleString()}원</span>
                        </div>
                        <div className="price-row-sync">
                            <span>교통비</span>
                            <span>{Number(transportText).toLocaleString()}원</span>
                        </div>
                        <div className="price-row-sync">
                            <span>기타</span>
                            <span>{Number(etcText).toLocaleString()}원</span>
                        </div>
                    </div>

                    <div className="box-bottom-area">
                        <hr className="price-divider" />
                        <div className="price-row-sync total-row">
                            <span>예상 총액</span>
                            <strong>{Number(totalCost).toLocaleString()}원</strong>
                        </div>
                    </div>
                </div>

                <div className="price-box-sync">
                    <div>
                        <h3>지원금 혜택</h3>
                        <div className="price-row-sync">
                            <span>예상 회사지원금</span>
                            <span>{Number(companySupport).toLocaleString()}원</span>
                        </div>
                        <div className="price-row-sync">
                            <span>예상 지자체 지원금</span>
                            <span>{Number(localGovSupport).toLocaleString()}원</span>
                        </div>
                        <div className="price-row-sync total-row">
                            <span>예상 총 지원금</span>
                            <span>{Number(totalSupport).toLocaleString()}원</span>
                        </div>
                    </div>

                    <div className="box-bottom-area">
                        <hr className="price-divider" />
                        <div className="price-row-sync">
                            <span>예상  개인 부담금</span>
                            <strong>{Number(personalCost).toLocaleString()}원</strong>
                        </div>
                        <p className="notice-text-sync">
                            ※ 증빙 및 승인에 따라 실제 지급액이 달라질 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="detail-button-area">
                <button type="button" onClick={() => navigate("/approval/reject/workcationNo")}>
                    상태 처리
                </button>
                <button type="button" onClick={() => navigate(-1)}>
                    이전으로
                </button>
            </div>
        </div>
    );
}

export default ApprovalQueueDetail;