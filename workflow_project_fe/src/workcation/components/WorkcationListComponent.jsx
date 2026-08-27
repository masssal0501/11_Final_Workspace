import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

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
        axios.get("http://localhost:8006/workflow/workcation/hub/mainRegion")
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
        axios.get(`http://localhost:8006/workflow/workcation/hub/subRegion?mainRegion=${mainRegion}`)
            .then(res => setSubRegionList(res.data))
            .catch(err => console.error("서브 지역 로딩 실패: ", err));
    }, [mainRegion]);

    // 3. 조건 변경 시 워케이션 목록 조회
    useEffect(() => {
        selectWorkcationList();
    }, [cpage, searchCondition, searchKeyword, mainRegion, subRegion, searchType]);

    const selectWorkcationList = async () => {
        try {
            const response = await axios.get("http://localhost:8006/workflow/workcation/list", {
                params: {
                    cpage: cpage,
                    condition: searchCondition,
                    keyword: searchKeyword,
                    mainRegion: mainRegion,
                    subRegion: subRegion,
                    searchType: searchType
                }
            });

            handleResponse(response.data);
        } catch (error) {
            console.error("조회 실패", error);
        }
    };

    // 응답 데이터 처리 후 공통 함수 (dataList, pageList)
    const handleResponse = (responseData) => {
        const items = Array.isArray(responseData) ? responseData
            : (responseData?.list || responseData?.content || []);

        const trArr = items.map((item) => (
            <tr key={item.workcationNo}
                onClick={() => navigate(`/workcation/detail/${item.workcationNo}`)}>
                <td>{item.workcationNo}</td>
                <td>{item.workcationTitle}</td>
                <td>{item.regionName || "-"}</td>
                <td>{item.employee?.empName || "-"}</td>
                <td>{item.createdAt ? item.createdAt.substring(0, 10) : "-"}</td>
                <td>{item.approverState || item.workcationStatus || "대기"}</td>
            </tr>
        ));

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
        setMainRegion(e.target.value);
        setSubRegion(""); // 메인이 바뀌면 상세 지역 초기화
    };

    const handleSubRegionChange = (e) => {
        setSubRegion(e.target.value);
    };

    return (
        <div align="center" className="content-area">
            <h2>워케이션 신청 목록</h2>

            <div className="workcation-btnSet">
                {/* 일정관리 버튼 */}
                <button className="skedule-btn"
                    onClick={() => setIsScheduleOpen(true)}>
                    일정관리
                </button>
                {isScheduleOpen && (
                    <WorkcationScheduleComponent onClose={() => setIsScheduleOpen(false)} />
                )}

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
                    onChange={(e) => setSearchType(e.target.value)}>
                    <option value="all">전체</option>
                    <option value="approved">승인</option>
                    <option value="canceled">취소</option>
                    <option value="hold">보류</option>
                    <option value="rejected">반려</option>
                    <option value="review">검토</option>
                </select>
            </div>

            {/* 신청하기 버튼 */}
            <div className="apply-btn">
                <button onClick={() => { navigate("/workcation/enrollform"); }}>신청</button>
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
                        <tr>
                            <td colSpan={6} align="center">
                                조회된 워케이션 내역이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <br /><br />

            {/* 페이징 영역 */}
            <div align="center" className="paging-area">
                {pageList}
            </div>
        </div>
    );
}

export default WorkcationListComponent;