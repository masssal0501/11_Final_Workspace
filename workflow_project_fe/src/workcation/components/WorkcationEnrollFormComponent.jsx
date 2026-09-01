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
    const [mainRegionDrop, setMainRegionDrop] = useState([]);
    const [subRegionDrop, setSubRegionDrop] = useState([]);

    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [programVisitDate, setProgramVisitDate] = useState(getTomorrow());
    const [restaurantVisitDate, setRestaurantVisitDate] = useState(getTomorrow());
    const [tourVisitDate, setTourVisitDate] = useState(getTomorrow());

    const [userCapacity, setUserCapacity] = useState(1);
    const [taskPurpose, setTaskPurpose] = useState("");

    const [hubType, setHubType] = useState("office"); //거점유형 선택
    const [hubDrop, setHubDrop] = useState([]); //선택한 거점과 유형에 오피스/숙소 데이터
    const [selectHubNo, setSelectHubNo] = useState(""); //최종 선택한 메인 거점

    const [optionPlaceData, setOptionPlaceData] = useState({}); //선택한 옵션 버튼
    const [optionPlaceDrop, setOptionPlaceDrop] = useState({}); //각 옵션 유형(체험, 맛집, 관광) 목록

    // 동적 옵션 버튼(tr 출력)
    const [selectedBtns, setSelectedBtns] = useState([]);

    // 업무계획 추가(업무 일수, 업무내용)
    const [planList, setPlanList] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [days, setDays] = useState("");

    // 비용 계산용 추가 state (교통비, 기타)
    const [transportText, setTransportText] = useState("");
    const [etcText, setEtcText] = useState("");


    //교통
    const handleTextChange = (e, setter) => {
        const val = e.target.value;
        setter(val === "" ? "" : Number(val));
    }

    //오늘날짜 구하기
    function getToday() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    //내일 날짜(방문일) 구하기
    function getTomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    // BASE_URL 생성
    const BASE_URL = 'http://localhost:8006/workflow';

    // 1. 메인 지역 목록 조회 (강원, 부산, 제주 등)
    useEffect(() => {
        axios.get(`${BASE_URL}/workcation/hub/mainRegion`)
            .then(res => {
                const listData = Array.isArray(res.data)
                    ? res.data
                    : (Array.isArray(res.data?.list) ? res.data.list : []);
                setMainRegionDrop(listData);
            })
            .catch(err => {
                console.error("메인 지역 로딩 실패: ", err);
                setMainRegionDrop([]);
            });
    }, []);

    // 2. 메인 지역이 바뀔 때마다 하위 상세 지역 조회 (안전 처리 추가)
    useEffect(() => {
        if (!mainRegion) {
            setSubRegionDrop([]);
            return;
        }
        axios.get(`${BASE_URL}/workcation/hub/subRegion?mainRegion=${mainRegion}`)
            .then(res => {
                const listData = Array.isArray(res.data)
                    ? res.data
                    : (Array.isArray(res.data?.list) ? res.data.list : []);
                setSubRegionDrop(listData);
            })
            .catch(err => {
                console.error("서브 지역 로딩 실패: ", err);
                setSubRegionDrop([]);
            });
    }, [mainRegion]);

    /** 메인지역 변경시 서브지역 및 버튼상태 초기화 */
    const handleRegionChange = (newMain, newSub) => {
        setMainRegion(newMain);
        setSubRegion(newSub);
        setSelectHubNo("");

        //옵션 상태 초기화
        setSelectedBtns([]);
        setOptionPlaceData({});
        setOptionPlaceData({});
    };

    // 거점 유형 변경 핸들러
    const handleHubChange = (e) => {
        setHubType(e.target.value);
        setSelectHubNo("");

        //옵션 상태 초기화
        setSelectedBtns([]);
        setOptionPlaceData({});
        setOptionPlaceData({});
    };

    // 3. 거점 목록 조회 (안전 처리 추가)
    useEffect(() => {
        if (!mainRegion || !subRegion) {
            setHubDrop([]);
            return;
        }
        const typeCode = hubType === "office" ? 1 : 2;
        axios.get(`${BASE_URL}/workcation/hub/list?mainRegion=${mainRegion}&subRegion=${subRegion}&hubType=${typeCode}`)
            .then(res => {
                const listData = Array.isArray(res.data)
                    ? res.data
                    : (Array.isArray(res.data?.list) ? res.data.list : []);
                setHubDrop(listData);
                setSelectHubNo("");
            })
            .catch(err => {
                console.error("거점 목록 조회 실패: ", err);
                setHubDrop([]);
            });
    }, [mainRegion, subRegion, hubType]);

    //4. 선택한 메인과 서브지역에 따라 해당 Place DB조회 
    useEffect(() => {
        selectedBtns.forEach(key => {
            const placeConfig = OPTION_CONFIG[key];

            //메인, 서브, 
            if (!mainRegion || !subRegion || !placeConfig) return;

            axios.get(`${BASE_URL}/workcation/hub/list`, {
                params: {
                    mainRegion: mainRegion,
                    subRegion: subRegion,
                    hubType: placeConfig.typeCode
                }
            })
                .then(res => {
                    const raw = res.data;
                    const listData = Array.isArray(raw)
                        ? raw
                        : (Array.isArray(raw?.list) ? raw.list : (Array.isArray(raw?.data) ? raw.data : []));

                    console.log(`[${placeConfig.label}] 조회 성공:`, listData);
                    setOptionPlaceDrop(prev => ({ ...prev, [key]: listData }));
                })
                .catch(err => {
                    console.error(`[${placeConfig.label}] 목록 조회 실패:`, err);
                    setOptionPlaceDrop(prev => ({ ...prev, [key]: [] }));
                });
        });
    }, [mainRegion, subRegion, selectedBtns]);

    const currentHub = (hubDrop || []).find(h => String(h?.hubNo) === String(selectHubNo));

    // 옵션 추가 (누르는 순대로 쌓임)
    const handleAddBtns = (type) => {
        if (!mainRegion || !subRegion) return alert("지역을 먼저 선택해주세요.");
        if (!selectedBtns.includes(type)) setSelectedBtns([...selectedBtns, type]);
    };

    // 옵션 제거
    const handleRemoveBtn = (key) => {
        setSelectedBtns(selectedBtns.filter((item) => item !== key));
        const copy = { ...optionPlaceData };
        delete copy[key];
        setOptionPlaceData(copy);
    };

    // 체험/프로그램/관광 장소와 방문일자 저장(스케줄)
    const handlePlaceDate = (key, field, value) => {
        setOptionPlaceData(prev => ({
            ...prev, [key]: {
                ...prev[key], [field]: value
            }
        }));
    };

    /** 누른 버튼에 따라 해당 tr을 보여주는 함수 */
    const renderBtnRow = (key) => {
        const placeConfig = OPTION_CONFIG[key];
        if (!placeConfig) return null;

        const isSelected = selectedBtns.includes(key);
        const itemList = optionPlaceDrop[key] || [];
        const hubItemList = itemList.filter(item => (item.hubStatus) !== 'CLOSE'); // CLOSE 상태 제외
        const hasValiItem = hubItemList.length > 0;

        const selectedOptObj = optionPlaceData[key] || {};
        const selectedHub = selectedOptObj.item || null;
        const selectedDate = selectedOptObj.date || "";

        return (
            <tr key={key}
                className={!isSelected ? "option-btn-empty" : ""} >
                <th>{placeConfig.label}</th>

                {!isSelected ? (
                    /** 1)아직 선택하지 않았을 시 고정자리에 + 표시 */
                    <td colSpan={3}>
                        <button
                            type="button"
                            className="add-option-btn"
                            disabled={!selectHubNo}
                            onClick={() => handleAddBtns(key)} >
                            + {placeConfig.label} 추가
                        </button>
                    </td>
                ) : (
                    /* 2) 클릭후 활성화 되엇을 시 셀렉박스 + 방문일 + X 표시*/
                    <>
                        <td>
                            <select name={`${key}No`}
                                value={selectedHub ? selectedHub.hubNo : ""}
                                disabled={!hasValiItem} // 데이터 없을시 박스 비활성화
                                onChange={(e) => {
                                    const found = hubItemList.find(item => String(item?.hubNo) === e.target.value);
                                    handlePlaceDate(key, "item", found || null);
                                }}>
                                <option value="">
                                    {hasValiItem
                                        ? `${placeConfig.label} 선택`
                                        : `해당하는 ${placeConfig.label}이(가) 없습니다.`}
                                </option>
                                {hubItemList.map((item, index) => {
                                    const status = item.hubStatus;
                                    const isPaused = status === 'PAUSED';
                                    const isClosed = status === 'CLOSED';
                                    const isDisabled = isPaused || isClosed;
                                    const statusLabel = isClosed
                                        ? " 종료" : isPaused
                                            ? "일시중단" : (item.price ? `${item.price.toLocaleString()}원` : "무료입장");

                                    return (
                                        <option
                                            key={item.hubNo || index}
                                            value={item.hubNo}
                                            disabled={isDisabled}
                                            style={isDisabled ? { color: "#999999" } : {}} >
                                            {item.hubName} / {statusLabel}
                                        </option>
                                    );
                                })}
                            </select>
                        </td>
                        <th>방문일</th>
                        <td className="optionBtn-date">
                            <input type="date"
                                name={`${key}date`}
                                value={selectedDate || getTomorrow()}
                                onChange={(e) => handlePlaceDate(key, "date", e.target.value)} />
                            <button type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveBtn(key)}>
                                X
                            </button>
                        </td>
                    </>
                )}
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
    const hubPrice = currentHub ? Number(currentHub.price || 0) : 0;

    // 추가 선택한 옵션 총액
    const optionsPrice = Object.values(optionPlaceData).reduce((acc, hubObj) => {
        const itemPrice = hubObj?.item?.price || hubObj?.price || 0;
        return acc + Number(itemPrice);
    }, 0);

    // 총액 계산
    const totalCost = hubPrice + optionsPrice + Number(transportText) + Number(etcText);

    // 지자체 지원금
    const hubSupport = hubType === "office" ? hubPrice : Math.min(hubPrice, 200000);
    const programSupport = Math.min(optionsPrice, 300000);
    const totalSupport = hubSupport + programSupport;

    // 회사/개인 부담금
    const personalCost = Math.max(0, totalCost - totalSupport);

    // 제출 핸들러
    const handleSubmit = async () => {
        if (!startDate || !endDate) return alert("신청기간 입력");
        if (!mainRegion || !subRegion) return alert("지역선택");
        if (!selectHubNo) return alert("오피스 또는 숙소 선택");

        const insertworkcationData = {
            startDate,
            endDate,
            peopleCount: Number(userCapacity),
            purpose: taskPurpose,
            mainRegion,
            subRegion,
            placeType: hubType,
            hubNo: Number(selectHubNo),
            transportText: Number(transportText),
            etcText: Number(etcText),
            totalCost,
            personalCost,

            planList: planList.map(item => ({
                taskName: item.taskName,
                days: Number(item.days)
            })),

            options: Object.entries(optionPlaceData).map(([key, hubObj]) => ({
                type: key,
                hubNo: hubObj?.item ? hubObj.item.hubNo : null,
                visitDate: hubObj?.date || null
            }))
        };

        try {
            const response = await axios.post(`${BASE_URL}/workcation/hub/enrollForm`, insertworkcationData);
            if (response.status === 200 || response.status === 201) {
                alert("신청이 완료되었습니다.");
            }
        } catch (err) {
            console.error("실패", err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className="workcatrion-enroll-container">
            <h2 align="center">워케이션 신청</h2>

            <button className="insert-btn" type="button" onClick={handleSubmit}>
                제출하기
            </button>
            <table className="workcation-form-table">
                <tbody>
                    <tr>
                        <th>신청기간</th>
                        <td style={{ width: "300px" }}>
                            <input className="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)} />
                            ~
                            <input className="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)} />
                        </td>
                        <th>신청인원</th>
                        <td style={{ width: "200px" }}>
                            <input type="number"
                                value={userCapacity} onChange={(e) => setUserCapacity(e.target.value)} />명
                        </td>
                    </tr>
                    <tr>
                        <th>근무 목적</th>
                        <td>
                            <textarea value={taskPurpose} onChange={(e) => setTaskPurpose(e.target.value)}></textarea>
                        </td>

                        {/**지역선택 드롭 */}
                        <th>지역</th>
                        <td>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="drop-group">
                                    <select className="main-region"
                                        value={mainRegion}
                                        onChange={(e) => handleRegionChange(e.target.value, "")}>
                                        <option value="">지역명</option>
                                        {mainRegionDrop?.map((main, index) => {
                                            const val = typeof main === 'string' ? main : (main?.mainRegion || main?.name || "");
                                            if (!val) return null;

                                            return (
                                                <option key={`main-${val}-${index}`} value={val}>
                                                    {val}
                                                </option>
                                            );
                                        })}
                                    </select>

                                    <select
                                        className="sub-region"
                                        value={subRegion}
                                        onChange={(e) => handleRegionChange(mainRegion, e.target.value)}
                                        disabled={!mainRegion}>
                                        <option value="">상세 지역</option>
                                        {subRegionDrop?.map((sub, index) => {
                                            const val = typeof sub === 'string' ? sub : sub?.subRegion;
                                            if (!val) return null;
                                            return (
                                                <option key={`sub-${val}-${index}`} value={val}>
                                                    {val}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </form>
                        </td>
                    </tr>

                    {/**숙소/오피스 라디오버튼 */}
                    <tr>
                        <th>거점 유형</th>
                        <td>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="hubType"
                                    value="office"
                                    checked={hubType === "office"}
                                    onChange={handleHubChange} />
                                공유오피스
                            </label>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="hubType"
                                    value="accommodation"
                                    checked={hubType === "accommodation"}
                                    onChange={handleHubChange} />
                                숙소
                            </label>
                        </td>

                        {/**숙소/오피스 주소 */}
                        <th>위치 주소</th>
                        <td>
                            {currentHub ? currentHub.hubAddress : "선택 된 거점 없음"}
                        </td>
                    </tr>

                    {/**숙소/오피스 드롭 */}
                    {(() => {
                        //close 상태 항목 제외
                        const valiHubList = (hubDrop || []).filter(h => (h.hubStatus) !== 'CLOSE');
                        const hasValiHub = valiHubList.length > 0;
                        return (
                            <tr>
                                <th>{hubType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                                <td>
                                    <select value={selectHubNo}
                                        onChange={(e) => setSelectHubNo(e.target.value)}
                                        disabled={!subRegion || !hasValiHub}>
                                        <option value="">
                                            {!subRegion ? " 지역을 먼저 선택해주세요." : !hasValiHub ? "해당하는 장소가 없습니다." : `${hubType === "office" ? "오피스" : "숙소"}를 선택하세요.`}
                                        </option>
                                        {valiHubList.map((hub, index) => {
                                            const status = hub.hubStatus;
                                            const isPaused = status === 'PAUSED';

                                            return (
                                                <option key={`hub-${hub?.hubNo || index}`}
                                                    value={hub?.hubNo}
                                                    disabled={isPaused} >
                                                    {hub?.hubName} / {isPaused ? "일시중단" : (hub?.price ? `${hub.price.toLocaleString()}원` : "가격 정보 없음")}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </td>
                            </tr>
                        );
                    })()}
                    {/**오피스/숙소까지 최종선택 되엇을시  */}
                    {renderBtnRow("program")}
                    {renderBtnRow("restaurant")}
                    {renderBtnRow("tour")}
                </tbody>
            </table>





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
                        {planList?.map((item) => (
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

            <div className="all-price-container">
                <div className="left-price-box">
                    <h3>지출 내역</h3>
                    <div className="left-price-row">
                        <span>{hubType === "office" ? "오피스 이용료" : "숙박비"}</span>
                        <span>{hubPrice.toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>프로그램 활동비</span>
                        <span>{optionsPrice.toLocaleString()}원</span>
                    </div>
                    <div className="left-price-row">
                        <span>교통비</span>
                        <div className="left-price-input">
                            <input type="text"
                                value={transportText}
                                onChange={(e) => setTransportText(Number(e.target.value))} />원
                        </div>
                    </div>
                    <div className="left-price-row">
                        <span>기타</span>
                        <div className="left-price-input">
                            <input type="number"
                                value={etcText}
                                onChange={(e) => setEtcText(Number(e.target.value))} />원
                        </div>
                    </div>
                    <hr />
                    <div className="left-price-input total">
                        <span>예상 총액</span>
                        <strong>{totalCost.toLocaleString()}원</strong>
                    </div>
                </div>

                <div className="left-price-box">
                    <h3>지원금 혜택</h3>
                    <div className="right-price-row">
                        <span>{hubType === "office" ? "오피스 지원" : "숙박비 지원"}</span>
                        <span>{hubType === "office" ? `${hubSupport.toLocaleString()}원` : `최대 ${hubSupport.toLocaleString()}원`}</span>
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
                        <span>개인부담금</span>
                        <strong>{personalCost.toLocaleString()}원</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkcationEnrollFormComponent;