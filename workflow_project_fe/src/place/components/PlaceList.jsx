import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { placeApi } from "../api/placeApi";
import PlaceItem from "./PlaceItem";

import "../style/placeList.css";

function PlaceList() {

    const [placeList, setPlaceList] = useState([]);
    const [keyword, setKeyword] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    const searchKeyword = searchParams.get("keyword") || "";
    const searchType = searchParams.get("type") || "";
    const searchRegion = searchParams.get("region") || "";
    const searchSubRegion = searchParams.get("subRegion") || "";

    const cpage =
        parseInt(searchParams.get("cpage")) || 1;

    const navigate = useNavigate();

    // 페이지 정보
    const [pageInfo, setPageInfo] = useState(null);


    // 하위 지역 목록
    const subRegionList = {

        "강원도": [
            "강릉시",
            "속초시",
            "양양군",
            "춘천시",
            "평창군"
        ],

        "부산": [
            "해운대구",
            "영도구",
            "수영구",
            "부산진구",
            "중구"
        ],

        "제주도": [
            "서귀포시",
            "제주시"
        ]

    };


    // 목록 조회
    useEffect(() => {

        if (searchKeyword === "") {

            selectPlaceList();

        } else {

            searchPlaceList();

        }

    }, [
        cpage,
        searchKeyword,
        searchType,
        searchRegion,
        searchSubRegion
    ]);


    // 장소 정보 목록 조회
    const selectPlaceList = async () => {

        try {

            const response =
                await placeApi.getPlaceList(
                    cpage,
                    searchType,
                    searchRegion,
                    searchSubRegion
                );

            handleResponse(response);

        } catch (error) {

            console.log(
                "장소 정보 목록 조회용 ajax 통신 실패"
            );

            console.log(error);

        }

    };


    // 검색어 변경
    const handleChange = (e) => {

        setKeyword(e.target.value);

    };


    // 장소 유형 변경
    const handleTypeChange = (e) => {

        const type = e.target.value;

        setSearchParams({

            cpage: 1,

            keyword: searchKeyword,

            type: type,

            region: searchRegion,

            subRegion: searchSubRegion

        });

    };


    // 메인 지역 변경
    const handleRegionChange = (e) => {

        const region = e.target.value;

        setSearchParams({

            cpage: 1,

            keyword: searchKeyword,

            type: searchType,

            region: region,

            subRegion: ""

        });

    };


    // 하위 지역 변경
    const handleSubRegionChange = (e) => {

        const subRegion = e.target.value;

        setSearchParams({

            cpage: 1,

            keyword: searchKeyword,

            type: searchType,

            region: searchRegion,

            subRegion: subRegion

        });

    };


    // 검색 버튼
    const handleClick = (e) => {

        e.preventDefault();

        setSearchParams({

            cpage: 1,

            keyword: keyword,

            type: searchType,

            region: searchRegion,

            subRegion: searchSubRegion

        });

    };


    // 장소 정보 검색
    const searchPlaceList = async () => {

        try {

            const response =
                await placeApi.searchPlaceList(
                    cpage,
                    searchKeyword,
                    searchType,
                    searchRegion,
                    searchSubRegion
                );

            handleResponse(response);

        } catch (error) {

            console.log(
                "장소 정보 검색용 ajax 통신 실패"
            );

            console.log(error);

        }

    };


    // 조회 결과 처리
    const handleResponse = (response) => {

        console.log("장소 목록 응답:", response);


        /*
         * 백엔드 응답
         *
         * {
         *     list: [...],
         *     pageInfo: {...}
         * }
         */


        // 장소 목록
        const item =
            Array.isArray(response)
                ? response
                : (response?.list || []);


        setPlaceList(item);


        // 페이지 정보
        const info =
            response?.pageInfo || null;


        setPageInfo(info);

    };


    // 페이지 이동
    const handlePageChange = (page) => {

        setSearchParams({

            cpage: page,

            keyword: searchKeyword,

            type: searchType,

            region: searchRegion,

            subRegion: searchSubRegion

        });

    };


    return (

        <main className="wf-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">지역 정보 목록</h1>
                    <p className="wf-page-description">거점 주변의 체험 프로그램, 맛집, 관광지 정보를 조회합니다.</p>
                </div>

                <div className="wf-page-actions">
                    <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() =>
                            navigate("/placeInfo/ai")
                        }
                    >
                        AI에게 장소 및 일정 추천 받기
                    </button>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="place-list">

            {/* 검색 영역 */}
            <div className="place-search">


                {/* 장소 유형 */}
                <select
                    value={searchType}
                    onChange={handleTypeChange}
                >

                    <option value="">
                        전체 유형
                    </option>

                    <option value="3">
                        체험 프로그램
                    </option>

                    <option value="4">
                        맛집
                    </option>

                    <option value="5">
                        관광지
                    </option>

                </select>


                {/* 메인 지역 */}
                <select
                    value={searchRegion}
                    onChange={handleRegionChange}
                >

                    <option value="">
                        전체 지역
                    </option>

                    <option value="강원도">
                        강원도
                    </option>

                    <option value="부산">
                        부산
                    </option>

                    <option value="제주도">
                        제주도
                    </option>

                </select>


                {/* 하위 지역 */}
                <select
                    value={searchSubRegion}
                    onChange={handleSubRegionChange}
                    disabled={!searchRegion}
                >

                    <option value="">

                        {searchRegion
                            ? "상세 지역을 선택해주세요."
                            : "지역을 먼저 선택해주세요."
                        }

                    </option>


                    {searchRegion &&
                        subRegionList[searchRegion]?.map(
                            (subRegion) => (

                                <option
                                    key={subRegion}
                                    value={subRegion}
                                >
                                    {subRegion}
                                </option>

                            )
                        )
                    }

                </select>


                {/* 검색 */}
                <div className="search-box">

                    <input
                        type="text"
                        placeholder="장소명을 입력해주세요"
                        value={keyword}
                        onChange={handleChange}
                    />

                    <button onClick={handleClick}>
                        검색
                    </button>

                </div>

            </div>


            <hr />


            {/* 장소 정보 목록 */}
            <div>

                {placeList.length === 0 ? (

                    <div className="wf-state">
                        <div className="wf-state-title">등록된 지역 정보가 없습니다.</div>
                    </div>

                ) : (

                    placeList.map((place) => (

                        <PlaceItem
                            key={place.hubNo}
                            item={place}
                        />

                    ))

                )}

            </div>


            {/* 페이징 */}
            {pageInfo && pageInfo.maxPage > 0 && (

                <div className="pagination">


                    {/* 이전 버튼 */}
                    <button
                        className={
                            cpage === 1
                                ? "btn btn-info btn-sm"
                                : "btn btn-outline-info btn-sm"
                        }
                        disabled={cpage === 1}
                        onClick={() =>
                            handlePageChange(cpage - 1)
                        }
                    >
                        &lt;
                    </button>


                    {/* 페이지 번호 */}
                    {Array.from(
                        {
                            length:
                                pageInfo.endPage -
                                pageInfo.startPage +
                                1
                        },
                        (_, index) =>
                            pageInfo.startPage + index
                    ).map((page) => (

                        <button
                            key={page}
                            className={
                                cpage === page
                                    ? "btn btn-info btn-sm"
                                    : "btn btn-outline-info btn-sm"
                            }
                            onClick={() =>
                                handlePageChange(page)
                            }
                        >
                            {page}
                        </button>

                    ))}


                    {/* 다음 버튼 */}
                    <button
                        className={
                            cpage === pageInfo.maxPage
                                ? "btn btn-info btn-sm"
                                : "btn btn-outline-info btn-sm"
                        }
                        disabled={
                            cpage === pageInfo.maxPage
                        }
                        onClick={() =>
                            handlePageChange(cpage + 1)
                        }
                    >
                        &gt;
                    </button>


                </div>

            )}

            </div>
            </div>
        </main>

    );

}

export default PlaceList;