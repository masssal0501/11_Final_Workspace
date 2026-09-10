import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../style/ApprovalHistoryList.css";
import { ApprovalApi } from "../api/ApprovalApi";

function ApprovalHistoryList() {

    const [dataList, setDataList] = useState([]);

    const [pageInfo, setPageInfo] = useState(null);

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    // 날짜
    const [startDate, setStartDate] = useState(
        searchParams.get("startDate") || ""
    );

    const [endDate, setEndDate] = useState(
        searchParams.get("endDate") || ""
    );

    // 검색
    const [searchType, setSearchType] = useState(
        searchParams.get("searchType") || "workcationTitle"
    );

    const [keyword, setKeyword] = useState(
        searchParams.get("keyword") || ""
    );

    const cpage =
        parseInt(searchParams.get("cpage")) || 1;


    // 승인 이력 목록 조회
    useEffect(() => {

        ApprovalApi.getApprovalList(
            cpage,
            startDate,
            endDate,
            searchType,
            keyword
        )
            .then((data) => {

                console.log(
                    "승인 이력 조회 결과:",
                    data
                );

                console.log(
                    "페이지 정보:",
                    data.pageInfo
                );

                setDataList(data.list || []);

                setPageInfo(data.pageInfo || null);

            })
            .catch((error) => {

                console.error(
                    "승인 이력 조회 실패:",
                    error
                );

                setDataList([]);

                setPageInfo(null);

            });

    }, [
        cpage,
        startDate,
        endDate,
        searchType,
        keyword
    ]);


    // 검색
    const handleSearch = () => {

        // 날짜 둘 다 입력했을 때만 날짜 비교
        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            alert(
                "시작일은 종료일보다 빠르거나 같아야 합니다."
            );

            return;
        }

        setSearchParams({
            cpage: 1,
            startDate: startDate,
            endDate: endDate,
            searchType: searchType,
            keyword: keyword
        });

    };


    // 페이지 이동
    const handlePageChange = (page) => {

        setSearchParams({
            cpage: page,
            startDate: startDate,
            endDate: endDate,
            searchType: searchType,
            keyword: keyword
        });

    };


    return (

        <main className="wf-container historyList">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">승인 이력</h1>
                    <p className="wf-page-description">처리 완료된 워케이션 승인 이력을 조회합니다.</p>
                </div>
            </section>


            {/* 검색 영역 */}
            <div className="filter-area">

                {/* 검색 조건 */}
                <select
                    className="search-type"
                    value={searchType}
                    onChange={(e) =>
                        setSearchType(e.target.value)
                    }
                >
                    <option value="workcationTitle">
                        제목
                    </option>

                    <option value="workPlan">
                        내용
                    </option>
                </select>


                {/* 검색어 */}
                <input
                    className="search-input"
                    type="text"
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    placeholder="검색어를 입력하세요."
                />


                {/* 시작일 */}
                <input
                    className="date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                        setStartDate(e.target.value)
                    }
                />


                <span className="date-separator">
                    ~
                </span>


                {/* 종료일 */}
                <input
                    className="date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                        setEndDate(e.target.value)
                    }
                />

            </div>


            {/* 승인 이력 목록 */}
            <div>

                <table>

                    <thead>

                        <tr className="thead">

                            <th>번호</th>
                            <th>워케이션 제목</th>
                            <th>신청자</th>
                            <th>워케이션 기간</th>
                            <th>승인자</th>
                            <th>승인 일시</th>

                        </tr>

                    </thead>


                    <tbody>

                        {dataList.length > 0 ? (

                            dataList.map((item) => (

                                <tr
                                    key={item.workcationNo}
                                    onClick={() =>
                                        navigate(
                                            `/approval/history/detail/${item.workcationNo}`
                                        )
                                    }
                                    style={{
                                        cursor: "pointer"
                                    }}
                                >

                                    <td>
                                        {item.workcationNo}
                                    </td>


                                    <td>
                                        {item.workcationTitle}
                                    </td>


                                    <td>
                                        {item.employee?.empName}
                                    </td>


                                    <td>
                                        {item.startAt?.replace(
                                            "T",
                                            " "
                                        )}

                                        {" ~ "}

                                        {item.endAt?.replace(
                                            "T",
                                            " "
                                        )}
                                    </td>


                                    <td>
                                        {item.approver?.empName || "-"}
                                    </td>


                                    <td>
                                        {item.approvetAt?.replace(
                                            "T",
                                            " "
                                        ) || "-"}
                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr className="wf-empty-row">

                                <td colSpan={6}>
                                    조회된 내역이 없습니다.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>


            {/* 페이징 */}
            {pageInfo && pageInfo.maxPage > 0 && (

                <div className="pagination">

                    {/* 이전 */}
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


                    {/* 다음 */}
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

        </main>
    );
}

export default ApprovalHistoryList;