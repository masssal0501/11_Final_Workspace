import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getMainRegionList, getSubRegionList, getWorkcationList } from "../api/WorkcationApi";

import WorkcationScheduleComponent from "./WorkcationScheduleComponent";

import "../styles/WorkcationList.css";

// 선택 옵션 설정 (WorkcationItemComponent에 있던 상수)
export const OPTION_CONFIG = {
    program: { label: "체험 프로그램", key: "program", priceKey: "programPrice", dateName: "programDate" },
    restaurant: { label: "맛집", key: "restaurant", priceKey: "restaurantPrice", dateName: "restaurantDate" },
    tour: { label: "관광지", key: "tour", priceKey: "tourPrice", dateName: "tourDate" }
};

function WorkcationListComponent() {

    const navigate = useNavigate(); // 페이지 이동 함수

    // 지역 관련 상태
    const [mainRegion, setMainRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");
    const [mainRegionList, setMainRegionList] = useState([]);
    const [subRegionList, setSubRegionList] = useState([]);

    // 검색 및 페이징 상태
    const [searchType, setSearchType] = useState("all");
    const [searchParams, setSearchParams] = useSearchParams();
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const searchCondition = searchParams.get("condition") || "all";
    const searchKeyword = searchParams.get("keyword") || "";
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [dataList, setDataList] = useState([]);
    const [pageList, setPageList] = useState([]);

    // 1. 메인 지역 목록 조회 (강원, 부산, 제주 등)
    useEffect(() => {
        getMainRegionList()
            .then(res => {
                const data = Array.isArray(res) ? res : (res.list || []);
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
        getSubRegionList(mainRegion)
            .then(res => setSubRegionList(res))
            .catch(err => console.error("서브 지역 로딩 실패: ", err));
    }, [mainRegion]);

    // 3. 조건 변경 시 워케이션 목록 조회
    useEffect(() => {
        if(mainRegion && !subRegion){
            return;
        }
        selectWorkcationList();
    }, [cpage, searchCondition, searchKeyword, mainRegion, subRegion, searchType]);

    const selectWorkcationList = async () => {
        try {
            const responseData = await getWorkcationList({
                cpage: cpage,
                condition: searchCondition,
                keyword: searchKeyword,
                mainRegion: mainRegion,
                subRegion: subRegion,
                searchType: searchType
            });

            handleResponse(responseData);
        } catch (error) {
            console.error("조회 실패", error);
        }
    };

    // 상태값을 배지로 표시하기 위한 톤 매핑(표시 전용, 데이터 값 자체는 변경하지 않음)
    const renderStatusBadge = (item) => {
        const raw = item.approverState || item.workcationStatus || "대기";
        const toneMap = {
            "대기": "bg-warning", "W": "bg-warning",
            "승인": "bg-success", "A": "bg-success",
            "취소": "bg-secondary", "C": "bg-secondary",
            "보류": "bg-secondary", "H": "bg-secondary",
            "반려": "bg-danger", "J": "bg-danger",
        };
        const labelMap = { "W": "대기", "A": "승인", "C": "취소", "H": "보류", "J": "반려" };
        const label = labelMap[raw] || raw;
        const tone = toneMap[raw] || "bg-primary";
        return <span className={`badge ${tone}`}>{label}</span>;
    };

    // 응답 데이터 처리 후 공통 함수 (dataList, pageList)
    const handleResponse = (responseData) => {
        const items = Array.isArray(responseData) ? responseData
            : (responseData?.list || responseData?.content || []);

        const trArr = items.map((item) => {
            const main = item.mainRegion || "";
            const sub = item.subRegion || "";
            const regionText = (main || sub) ? `${main} ${sub}`.trim() : "-";
            return (
                <tr key={item.workcationNo}
                    onClick={() => navigate(`/workcation/detail/${item.workcationNo}`)}>
                    <td>{item.workcationNo}</td>
                    <td style={{ whiteSpace: "pre-line" }}>{item.workcationTitle}</td>
                    <td>{regionText}</td>
                    <td>{item.employee?.empName || "-"}</td>
                    <td>{item.createdAt ? item.createdAt.substring(0, 10) : "-"}</td>
                    <td>{renderStatusBadge(item)}</td>
                </tr>
            )
        });

        setDataList(trArr);

        // pageList 생성
        const totalPages = responseData.totalPages || 1;
        const btnArr = [];

        // 이전 버튼
        btnArr.push(
            <button key="prev"
                className="page-btn"
                disabled={cpage === 1}
                onClick={() => cpage > 1 && setSearchParams({
                    cpage: cpage - 1, condition: searchCondition, keyword: searchKeyword, mainRegion: mainRegion,
                    subRegion: subRegion,
                    searchType: searchType
                })}>
                &lt;
            </button>
        );

        // 페이지 번호 버튼
        for (let p = 1; p <= totalPages; p++) {
            btnArr.push(
                <button
                    key={p}
                    className={`page-btn ${cpage === p ? `active` : ''}`}
                    onClick={() => setSearchParams({
                        cpage: p, condition: searchCondition, keyword: searchKeyword, mainRegion: mainRegion,
                        subRegion: subRegion,
                        searchType: searchType
                    })}>
                    {p}
                </button>
            );
        }

        // 다음 버튼
        btnArr.push(
            <button
                key="next"
                className="page-btn"
                disabled={cpage === totalPages}
                onClick={() => cpage < totalPages && setSearchParams({
                    cpage: cpage + 1, condition: searchCondition, keyword: searchKeyword,
                    mainRegion: mainRegion,
                    subRegion: subRegion,
                    searchType: searchType
                })}>
                &gt;
            </button>
        );
        setPageList(btnArr);
    };

    // 지역 드롭다운 변경 이벤트 핸들러
    const handleMainRegionChange = (e) => {
        const newMain = e.target.value;
        setMainRegion(newMain);
        setSubRegion(""); // 메인이 바뀌면 상세 지역 초기화

        setSearchParams({
            cpage: 1,
            condition: searchCondition,
            keyword: searchKeyword,
            mainRegion: newMain,
            subRegion: "",
            searchType: searchType
        })
    };

    const handleSubRegionChange = (e) => {
        const newSub = e.target.value;
        setSubRegion(newSub);

        setSearchParams({
            cpage: 1,
            condition: searchCondition,
            keyword: searchKeyword,
            mainRegion: mainRegion,
            subRegion: newSub,
            searchType: searchType
        })
    };

    //승인/취소 등 상태 변경 핸들러
    const handleSearchTypeChange = (e) => {
        const newSearchType = e.target.value;
        setSearchType(newSearchType);

        setSearchParams({
            cpage: 1,
            condition: searchCondition,
            keyword: searchKeyword,
            mainRegion: mainRegion,
            subRegion: subRegion,
            searchType: newSearchType
        })
    }

    return (
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">워케이션 신청 목록</h1>
                    <p className="wf-page-description">워케이션 신청 내역을 조회하고 새 신청을 등록합니다.</p>
                </div>

                <div className="wf-page-actions">
                    <button className="skedule-btn"
                        onClick={() => setIsScheduleOpen(true)}>
                        일정관리
                    </button>
                    <button className="btn btn-primary" onClick={() => { navigate("/workcation/enrollform"); }}>
                        + 워케이션 신청
                    </button>
                </div>
            </section>

            {isScheduleOpen && (
                <WorkcationScheduleComponent onClose={() => setIsScheduleOpen(false)} />
            )}

            <div className="wf-page-content">
                <div className="workcation-btnSet">
                    {/* 지역 및 상세지역 드롭다운 (기존 WorkcationItemComponent 내용 병합) */}
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="drop-group">
                            <select className="main-region"
                                value={mainRegion}
                                onChange={handleMainRegionChange}>
                                <option value="">지역명</option>
                                {mainRegionList.map((main, index) => (
                                    <option key={index} value={typeof main === 'string' ? main : main.main_region}>
                                        {typeof main === 'string' ? main : main.main_region}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="sub-region"
                                value={subRegion}
                                onChange={handleSubRegionChange}
                                disabled={!mainRegion}>
                                <option value="">상세 지역명</option>
                                {subRegionList.map((sub, index) => (
                                    <option key={index} value={typeof sub === 'string' ? sub : sub.sub_region}>
                                        {typeof sub === 'string' ? sub : sub.sub_region}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {/* 상태 드롭다운 */}
                    <select className="status-drop"
                        value={searchType}
                        onChange={handleSearchTypeChange}>
                        <option value="all">전체</option>
                        <option value="approved">승인</option>
                        <option value="canceled">취소</option>
                        <option value="hold">보류</option>
                        <option value="rejected">반려</option>
                        <option value="review">검토</option>
                    </select>
                </div>

                <table className="workcation-list">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>지역</th>
                            <th>신청자</th>
                            <th>신청일</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataList.length > 0 ? dataList : (
                            <tr className="wf-empty-row">
                                <td colSpan={6}>
                                    조회된 워케이션 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 페이징 영역 */}
                <div align="center" className="paging-area">
                    {pageList}
                </div>
            </div>
        </main>
    );
}

export default WorkcationListComponent;