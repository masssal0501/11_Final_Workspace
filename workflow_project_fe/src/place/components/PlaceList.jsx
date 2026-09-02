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
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const navigate = useNavigate();

    const [pageList, setPageList] = useState([]);

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

            const response = await placeApi.getPlaceList(
                cpage,
                searchType,
                searchRegion,
                searchSubRegion
            );

            handleResponse(response);

        } catch (error) {

            console.log("장소 정보 목록 조회용 ajax 통신 실패");
            console.log(error);

        }

    };


    // 검색어 변경
    const handleChange = (e) => {

        setKeyword(e.target.value);

    };


    // 장소 유형 필터 변경
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


    // 메인 지역 필터 변경
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


    // 하위 지역 필터 변경
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


    // 검색 버튼 클릭
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

            const response = await placeApi.searchPlaceList(
                cpage,
                searchKeyword,
                searchType,
                searchRegion,
                searchSubRegion
            );

            handleResponse(response);

        } catch (error) {

            console.log("장소 정보 검색용 ajax 통신 실패");
            console.log(error);

        }

    };


    // 조회 결과 처리
    const handleResponse = (response) => {

        /*
         * 백엔드가 List<Place>를 바로 반환하는 경우
         */
        const item = Array.isArray(response)
            ? response
            : (response?.list || []);

        setPlaceList(item);

        /*
         * 현재 백엔드에서 페이징 정보를
         * 반환하지 않는 경우에는 페이징 버튼을 만들지 않음
         */
        const pageInfo = response?.pi;

        if (!pageInfo) {
            setPageList([]);
            return;
        }

        const btnArr = [];

        // 이전 버튼
        if (cpage === 1) {

            btnArr.push(
                <button
                    key="prev"
                    className="btn btn-info btn-sm"
                    disabled
                >
                    &lt;
                </button>
            );

        } else {

            btnArr.push(
                <button
                    key="prev"
                    className="btn btn-outline-info btn-sm"
                    onClick={() => {

                        setSearchParams({
                            cpage: cpage - 1,
                            keyword: searchKeyword,
                            type: searchType,
                            region: searchRegion,
                            subRegion: searchSubRegion
                        });

                    }}
                >
                    &lt;
                </button>
            );

        }


        // 페이지 번호
        for (
            let p = pageInfo.startPage;
            p <= pageInfo.endPage;
            p++
        ) {

            if (cpage === p) {

                btnArr.push(
                    <button
                        key={p}
                        className="btn btn-info btn-sm"
                    >
                        {p}
                    </button>
                );

            } else {

                btnArr.push(
                    <button
                        key={p}
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {

                            setSearchParams({
                                cpage: p,
                                keyword: searchKeyword,
                                type: searchType,
                                region: searchRegion,
                                subRegion: searchSubRegion
                            });

                        }}
                    >
                        {p}
                    </button>
                );

            }

        }


        // 다음 버튼
        if (cpage === pageInfo.maxPage) {

            btnArr.push(
                <button
                    key="next"
                    className="btn btn-info btn-sm"
                    disabled
                >
                    &gt;
                </button>
            );

        } else {

            btnArr.push(
                <button
                    key="next"
                    className="btn btn-outline-info btn-sm"
                    onClick={() => {

                        setSearchParams({
                            cpage: cpage + 1,
                            keyword: searchKeyword,
                            type: searchType,
                            region: searchRegion,
                            subRegion: searchSubRegion
                        });

                    }}
                >
                    &gt;
                </button>
            );

        }

        setPageList(btnArr);

    };


    return (

        <div className="place-list">

            <h2>지역 정보 목록</h2>


            {/* 검색 영역 */}
            <div className="place-search">


                {/* 장소 유형 필터 */}
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


                {/* 메인 지역 필터 */}
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


                {/* 하위 지역 필터 */}
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
                        subRegionList[searchRegion]?.map((subRegion) => (

                            <option
                                key={subRegion}
                                value={subRegion}
                            >
                                {subRegion}
                            </option>

                        ))
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

                {/* AI 추천 */}
                <button
                    onClick={() => navigate("/placeInfo/ai")}
                    className="ai-button"
                >
                    AI에게 장소 및 일정 추천 받기
                </button>

            </div>


            <hr />


            {/* 장소 정보 목록 */}
            <div>

                {placeList.length === 0 ? (

                    <p
                        style={{
                            textAlign: "center",
                            padding: "40px 0",
                            color: "#777"
                        }}
                    >
                        등록된 지역 정보가 없습니다.
                    </p>

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
            <div className="pagination">

                {pageList}

            </div>

        </div>

    );

}

export default PlaceList;