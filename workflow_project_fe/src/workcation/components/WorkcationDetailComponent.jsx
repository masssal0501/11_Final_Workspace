import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getWorkcationDetail, deleteWorkcation } from "../api/WorkcationApi";

import "../styles/WorkcationDetail.css";

function WorkcationDetailComponent() {

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
        return (
            <main className="wf-container">
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <span className="wf-state-title">워케이션 상세 정보를 불러오는 중입니다.</span>
                </div>
            </main>
        );
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
        option = [],
        approverState = "W"
    } = detailData;

    // BUG-008: 상태와 무관하게 "신청 완료"로 고정 표시되어 사용자가 승인 진행 상태를
    // 알 수 없었음 - 실제 approverState를 기준으로 라벨을 표시한다.
    const getStatusLabel = (state) => {
        switch (state) {
            case "W": return "승인 대기";
            case "H": return "보류";
            case "R": return "검토중";
            case "J": return "반려";
            case "A": return "승인 완료";
            case "C": return "취소";
            default: return "알 수 없음";
        }
    };

    // 상태 배지 색상 - 기존에는 상태와 무관하게 항상 success(녹색)로 고정 표시되어
    // 반려/취소 상태도 승인처럼 보이는 문제가 있었다(표시 전용 수정, 데이터/로직 변경 없음).
    const getStatusTone = (state) => {
        switch (state) {
            case "A": return "wf-badge-success";
            case "J": return "wf-badge-danger";
            case "C": return "wf-badge-neutral";
            case "H": return "wf-badge-neutral";
            case "R": return "wf-badge-info";
            case "W":
            default: return "wf-badge-warning";
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteWorkcation(workcationNo);
            alert("삭제가 완료되었습니다.");
            navigate("/workcation/list");
        } catch (err) {
            console.error("삭제 실패 :", err);
            alert("삭제 중 오류 발생");
        }
    }

    const handleUpdate = async () => {
        navigate(`/workcation/update/${workcationNo}`);
    }

    return (
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">워케이션 상세</h1>
                    <p className="wf-page-description">신청 정보와 진행 현황을 확인합니다.</p>
                </div>
                <div className="wf-page-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/workcation/list')}>
                        목록으로
                    </button>
                </div>
            </section>

            {/* 핵심 정보 요약: 상태 / 기간 / 지역 / 인원을 상단에서 바로 확인 */}
            <div className="wf-card" style={{ padding: "20px 24px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
                <div>
                    <div className="wf-desc">신청 상태</div>
                    <span className={`wf-badge ${getStatusTone(approverState)}`} style={{ marginTop: "4px" }}>{getStatusLabel(approverState)}</span>
                </div>
                <div>
                    <div className="wf-desc">신청기간</div>
                    <div className="wf-body" style={{ fontWeight: 700 }}>{startDate} ~ {endDate}</div>
                </div>
                <div>
                    <div className="wf-desc">지역</div>
                    <div className="wf-body" style={{ fontWeight: 700 }}>{mainRegion} {subRegion}</div>
                </div>
                <div>
                    <div className="wf-desc">신청인원</div>
                    <div className="wf-body" style={{ fontWeight: 700 }}>{peopleCount}명</div>
                </div>
            </div>

            <div className="wf-page-content">

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
                                <span className={`wf-badge ${getStatusTone(approverState)}`}>{getStatusLabel(approverState)}</span>
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

                    {/* 업무 완료 확인(MANAGER/ADMIN)용 진행률/완료 여부 - task_no가 있는
                        (실제 Task 레코드로 생성된) 업무에 대해서만 표시 가능하다 */}
                    <div className="task-plan-box right-box">
                        <ul className="task-plan-list">
                            {planList.map((item, index) => (
                                <li className="task-item-row" key={item.id || index}>
                                    <span className="task-days">
                                        {item.taskNo
                                            ? `${item.status === "Y" ? "완료" : "진행중"} (${item.progress ?? 0}%)`
                                            : "-"}
                                    </span>
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
                <button type="button" className="btn btn-outline-primary" onClick={handleUpdate}>
                    수정
                </button>
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
                    삭제
                </button>
            </div>
            </div>
        </main>
    );
}

export default WorkcationDetailComponent;