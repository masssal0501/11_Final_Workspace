import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { programApi } from "../../api/programApi";
import WorkcationProgramItem from "./WorkcationProgramItem";

function WorkcationProgramList() {

    const [programList, setProgramList] = useState([]);
    const [keyword, setKeyword] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    const searchKeyword = searchParams.get("keyword") || "";
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [pageList, setPageList] = useState([]);

    useEffect(() => {

        if (searchKeyword === "") {
            selectProgramList();
        } else {
            searchProgramList();
        }

    }, [cpage, searchKeyword]);


    // 전체 체험프로그램 목록 조회
    const selectProgramList = async () => {

        try {

            const response = await programApi.getProgramList(cpage);

            handleResponse(response);

        } catch (error) {

            console.log("체험 프로그램 목록 조회용 ajax 통신 실패");

        }

    };


    // 검색어 변경
    const handleChange = (e) => {

        setKeyword(e.target.value);

    };


    // 검색 버튼 클릭
    const handleClick = (e) => {

        e.preventDefault();

        setSearchParams({
            cpage: 1,
            keyword: keyword
        });

    };


    // 체험프로그램 검색
    const searchProgramList = async () => {

        try {

            const response = await programApi.searchProgramList(
                cpage,
                searchKeyword
            );

            handleResponse(response);

        } catch (error) {

            console.log("체험 프로그램 검색용 ajax 통신 실패");

        }

    };


    // 조회 결과 처리
    const handleResponse = (response) => {

        const item = response.list;

        // DB에서 받아온 데이터를 programList에 저장
        setProgramList(item);


        // 페이징 정보
        const pageInfo = response.pi;

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
                            keyword: searchKeyword
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
                                keyword: searchKeyword
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
                            keyword: searchKeyword
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

        <div className="program-list">

            <h2>체험프로그램 목록</h2>


            {/* 검색 영역 */}
            <div className="program-search">

                <select>
                    <option>전체</option>
                </select>


                <div className="search-box">

                    <input
                        type="text"
                        placeholder="체험프로그램 이름을 입력해주세요"
                        value={keyword}
                        onChange={handleChange}
                    />

                    <button onClick={handleClick}>
                        검색
                    </button>

                </div>


                <button className="ai-button">
                    AI에게 장소 및 일정 추천 받기
                </button>

            </div>


            <hr />


            {/* 체험프로그램 목록 */}
            <div>

                {programList.map((program) => (

                    <WorkcationProgramItem
                        key={program.hubNo}
                        item={program}
                    />

                ))}

            </div>


            {/* 페이징 */}
            <div className="pagination">

                {pageList}

            </div>

        </div>

    );

}

export default WorkcationProgramList;