import React, { useState, useEffect } from "react";
import axios from "axios";

import "../styles/WorkcationEnrollForm.css";

// 기존 WorkcationItemComponent에 있던 옵션 설정 상수
export const OPTION_CONFIG = {
    program: { label: "체험 프로그램", key: "program", priceKey: "programPrice", dateName: "programDate", typeCode: 3 },
    restaurant: { label: "맛집", key: "restaurant", priceKey: "restaurantPrice", dateName: "restaurantDate", typeCode: 4 },
    tour: { label: "관광지", key: "tour", priceKey: "tourPrice", dateName: "tourDate", typeCode: 5 }
};

function WorkcationEnrollFormComponent() {
    // 지역 데이터 state (WorkcationItemComponent 기능 포함)
    const [mainRegion, setMainRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");
    const [mainRegionList, setMainRegionList] = useState([]);
    const [subRegionList, setSubRegionList] = useState([]);

    // 고정 거점 선택
    const [placeType, setPlaceType] = useState("office");
    const [hubList, setHubList] = useState([]);
    const [selectHubNo, setSelectHubNo] = useState("");

    const [optionHubs, setOptionHubs] = useState({});
    const [optionItemLists, setOptionItemLists] = useState({});

    // 동적 옵션 버튼(tr 출력)
    const [selectedBtns, setSelectedBtns] = useState([]);

    // 업무계획 추가(업무 일수, 업무내용)
    const [planList, setPlanList] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [days, setDays] = useState("");

    // 비용 계산용 추가 state (교통비, 기타)
    const [trafficFee, setTrafficFee] = useState(0);
    const [etcFee, setEtcFee] = useState(0);

    // 1. 메인 지역 목록 조회 (강원, 부산, 제주 등)
    useEffect(() => {
        axios.get(`http://localhost:8006/api/hub/mainRegion`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.list || []);
                setMainRegionList(data);
            })
            .catch(err => console.error("메인 지역 로딩 실패: ", err));
    }, []);

    // 2. 메인 지역이 바뀔 때마다 하위 상세 지역 조회
    useEffect(() => {
        if (!mainRegion) {
            setSubRegionList([]);
            return;
        }
        axios.get(`http://localhost:8006/api/hub/subRegion?mainRegion=${mainRegion}`)
            .then(res => setSubRegionList(res.data))
            .catch(err => console.error("서브 지역 로딩 실패: ", err));
    }, [mainRegion]);

    /** 최상위 지역변경시 하위 옵션 및 거점 초기화 */
    const handleRegionChange = (newMain, newSub) => {
        setMainRegion(newMain);
        setSubRegion(newSub);
        setSelectHubNo("");
        setOptionHubs({});
    };

    // 거점 유형 변경 핸들러
    const handleTypeChange = (e) => {
        setPlaceType(e.target.value);
        setSelectHubNo("");
    };

    // 거점 목록 조회
    useEffect(() => {
        if (!mainRegion || !subRegion) {
            setHubList([]);
            return;
        }
        const typeCode = placeType === "office" ? 1 : 2;
        axios.get(`http://localhost:8006/api/hub/list?mainRegion=${mainRegion}&subregion=${subRegion}&hubType=${typeCode}`)
            .then(res => {
                setHubList(res.data);
                setSelectHubNo("");
            })
            .catch(err => console.error("거점 목록 조회 실패: ", err));
    }, [mainRegion, subRegion, placeType]);

    // 동적 옵션 아이템 목록 조회 (forEacch 오타 수정 완료)
    useEffect(() => {
        selectedBtns.forEach(key => {
            const config = OPTION_CONFIG[key];
            if (!mainRegion || !subRegion || !config) return;
            axios.get(`http://localhost:8006/api/hub/list?mainRegion=${mainRegion}&subregion=${subRegion}&hubType=${config.typeCode}`)
                .then(res => {
                    setOptionItemLists(prev => ({ ...prev, [key]: res.data }));
                })
                .catch(err => console.error(`${config.label} 목록조회 실패: `, err));
        });
    }, [mainRegion, subRegion, selectedBtns]);

    const currentHub = hubList.find(h => String(h.hubNo) === String(selectHubNo));

    // 옵션 추가 (누르는 순대로 쌓임)
    const handleAddBtns = (type) => {
        if (!mainRegion || !subRegion) return alert("지역을 먼저 선택해주세요.");
        if (!selectedBtns.includes(type)) setSelectedBtns([...selectedBtns, type]);
    };

    // 옵션 제거
    const handleRemoveBtn = (key) => {
        setSelectedBtns(selectedBtns.filter((item) => item !== key));
        const copy = { ...optionHubs };
        delete copy[key];
        setOptionHubs(copy);
    };

    /** 선택된 타입에 따라 해당 tr을 반환하는 함수 (itemName, Price 오타 수정 완료) */
    const renderBtnRow = (key) => {
        const config = OPTION_CONFIG[key];
        if (!config) return null;

        const itemList = optionItemLists[key] || [];
        const selectedItem = optionHubs[key] || "";

        return (
            <tr key={key}>
                <th>{config.label}</th>
                <td>
                    <select name={`${key}No`}
                        value={selectedItem ? selectedItem.hubNo : ""}
                        onChange={(e) => {
                            const found = itemList.find(item => String(item.hubNo) === e.target.value);
                            setOptionHubs({
                                ...optionHubs, [key]: found || null
                            });
                        }}>
                        <option value="">{config.label} 선택</option>
                        {itemList.map(item => (
                            <option
                                key={item.hubNo}
                                value={item.hubNo}>
                                {item.name} / {item.price ? `${item.price.toLocaleString()}원` : "가격 정보 없음"}
                            </option>
                        ))}
                    </select>
                </td>
                <th>방문일</th>
                <td className="optionBtn-date">
                    <input type="date" name={`${key}date`} />
                    <button type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveBtn(key)}>
                        X
                    </button>
                </td>
            </tr>
        );
    };

    // 업무 항목 추가 핸들러
    const handleAddPlan = () => {
        if (!taskName || !days) return alert("업무와 기간을 입력해주세요.");
        setPlanList([...planList, { id: Date.now(), taskName, days }]);
        setTaskName("");
        setDays("");
    };

    // 업무 항목 삭제 핸들러
    const handleRemovePlan = (id) => {
        setPlanList(planList.filter(item => item.id !== id));
    };

    // 숙박비 또는 오피스비
    const hubPrice = currentHub ? Number(currentHub.price) : 0;

    // 추가 선택한 옵션 총액
    const optionsPrice = Object.values(optionHubs).reduce((acc, hubObj) => {
        return acc + (hubObj ? Number(hubObj.price) : 0);
    }, 0);

    // 총액 계산
    const totalCost = hubPrice + optionsPrice + Number(trafficFee) + Number(etcFee);

    // 지자체 지원금
    const hubSupport = placeType === "office" ? hubPrice : Math.min(hubPrice, 200000);
    const programSupport = Math.min(optionsPrice, 300000);
    const totalSupport = hubSupport + programSupport;

    // 회사/개인 부담금
    const personalCost = Math.max(0, totalCost - totalSupport);

    return (
        <div className="workcatrion-enroll-container">
            <h2 align="center">워케이션 신청</h2>

            <button className="insert-btn" type="submit">
                제출하기
            </button>
            <table className="workcation-form-table">
                <tbody>
                    <tr>
                        <th>신청기간</th>
                        <td style={{ width: "300px" }}>
                            <input className="statDate" type="date" />
                            ~
                            <input className="endDate" type="date" />
                        </td>
                        <th>신청인원</th>
                        <td style={{ width: "200px" }}>
                            <input type="number" />명
                        </td>
                    </tr>
                    <tr>
                        <th>근무 목적</th>
                        <td>
                            <textarea name="" id=""></textarea>
                        </td>
                        <th>지역</th>
                        <td>
                            {/* 통합된 지역선택 드롭다운 영역 */}
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="drop-group">
                                    <select className="main-region"
                                        value={mainRegion}
                                        onChange={(e) => handleRegionChange(e.target.value, "")}>
                                        <option value="">지역명</option>
                                        {mainRegionList.map((main, index) => (
                                            <option key={index} value={typeof main === 'string' ? main : main.mainRegion}>
                                                {typeof main === 'string' ? main : main.mainRegion}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="sub-region"
                                        value={subRegion}
                                        onChange={(e) => handleRegionChange(mainRegion, e.target.value)}
                                        disabled={!mainRegion}>
                                        <option value="">상세 지역명</option>
                                        {subRegionList.map((sub, index) => (
                                            <option key={index} value={typeof sub === 'string' ? sub : sub.subRegion}>
                                                {typeof sub === 'string' ? sub : sub.subRegion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </form>
                        </td>
                    </tr>
                    {/* 거점 유형선택 */}
                    <tr>
                        <th>거점 유형</th>
                        <td>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="placeType"
                                    value="office"
                                    checked={placeType === "office"}
                                    onChange={handleTypeChange} />
                                공유오피스
                            </label>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="placeType"
                                    value="accommodation"
                                    checked={placeType === "accommodation"}
                                    onChange={handleTypeChange} />
                                숙소
                            </label>
                        </td>
                        <th>위치 주소</th>
                        <td>
                            {currentHub ? currentHub.address : "선택 된 거점 없음"}
                        </td>
                    </tr>

                    {/* 선택된 유형 드롭다운 */}
                    <tr>
                        <th>{placeType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                        <td>
                            <select value={selectHubNo}
                                onChange={(e) => setSelectHubNo(e.target.value)}
                                disabled={!subRegion}>
                                <option value="">
                                    {!subRegion ? " 지역을 먼저 선택해주세요." : `${placeType === "office" ? "오피스" : "숙소"}를 선택하세요.`}
                                </option>
                                {hubList.map((hub) => (
                                    <option key={hub.hubNo} value={hub.hubNo}>
                                        {hub.name} / {hub.price ? `1박 ${hub.price.toLocaleString()}원` : "가격 정보 없음"}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    {selectedBtns.map((type) => renderBtnRow(type))}
                </tbody>
            </table>

            {/* 하단 옵션추가 선택 영역 */}
            <div className="plus-btn-group">
                {!selectedBtns.includes("program") && (
                    <button type="button" onClick={() => handleAddBtns("program")}>
                        + 체험 프로그램
                    </button>
                )}
                {!selectedBtns.includes("restaurant") && (
                    <button type="button" onClick={() => handleAddBtns("restaurant")}>
                        + 맛집
                    </button>
                )}
                {!selectedBtns.includes("tour") && (
                    <button type="button" onClick={() => handleAddBtns("tour")}>
                        + 관광지
                    </button>
                )}
            </div>

            {/* 업무 계획 영역 */}
            <div className="task-plan-container">
                <h3 align="center">업무 계획</h3>

                <div className="task-paln-input">
                    <div className="task-plan-box">
                        <input type="text"
                            placeholder="업무명"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)} />
                        <input type="number"
                            placeholder="예상기간"
                            value={days}
                            onChange={(e) => setDays(e.target.value)} />일
                        <button type="button"
                            className="add-btn"
                            onClick={handleAddPlan}>
                            + 추가
                        </button>
                    </div>
                    <ul className="task-plan-list">
                        {planList.map((item) => (
                            <li className="plan-item" key={item.id}>
                                <span>{item.taskName}&ensp;{item.days}일</span>
                                <button type="button"
                                    className="delete-btn"
                                    onClick={() => handleRemovePlan(item.id)}>
                                    X
                                </button>
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
                        <span>{hubPrice.toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>프로그램 활동비</span>
                        <span>{optionsPrice.toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>교통비</span>
                        <div className="left-price-input">
                            <input type="number"
                                value={trafficFee}
                                onChange={(e) => setTrafficFee(Number(e.target.value))} />원
                        </div>
                    </div>
                    <div className="left-price-row">
                        <span>기타</span>
                        <div className="left-price-input">
                            <input type="number"
                                value={etcFee}
                                onChange={(e) => setEtcFee(Number(e.target.value))} />원
                        </div>
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
                        <span>{placeType === "office" ? `${hubSupport.toLocaleString()}원` : `최대 ${hubSupport.toLocaleString()}원`}</span>
                    </div>
                    <div className="right-price-row">
                        <span>체험비 지원</span>
                        <span>최대 {programSupport.toLocaleString()}원</span>
                    </div>
                    <div className="right-price-row total">
                        <span>지원금</span>
                        <span>{totalSupport.toLocaleString()}원</span>
                    </div>
                    <hr />
                    <div>
                        <span>회사/개인부담금</span>
                        <strong>{personalCost.toLocaleString()}원</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkcationEnrollFormComponent;