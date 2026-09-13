import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../style/ApprovalQueueList.css";
import { ApprovalApi } from "../api/ApprovalApi";
import { getStatusText, getStatusTone } from "../../../utils/StatusBadge";

function ApprovalQueueList() {

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


    // 상태
    const [approverState, setApproverState] = useState(
        searchParams.get("status") || ""
    );


    const cpage =
        parseInt(searchParams.get("cpage")) || 1;


    // 승인 대기 목록 조회
    useEffect(() => {

        ApprovalApi.getApprovalQueueList(
            cpage,
            startDate,
            endDate,
            searchType,
            keyword,
            approverState
        )
            .then((data) => {

                console.log(
                    "승인 대기 목록 조회 결과:",
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
                    "승인 대기 목록 조회 실패:",
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
        keyword,
        approverState
    ]);


    // 검색
    const handleSearch = () => {

        // 날짜를 둘 다 입력했을 경우 날짜 확인
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


        // 검색 결과는 1페이지부터
        setSearchParams({
            cpage: 1,
            startDate: startDate,
            endDate: endDate,
            searchType: searchType,
            keyword: keyword,
            status: approverState
        });

    };


    // 상태 변경
    const handleStatusChange = (e) => {

        const status = e.target.value;

        setApproverState(status);

        // 상태를 변경하면 1페이지부터 조회
        setSearchParams({
            cpage: 1,
            startDate: startDate,
            endDate: endDate,
            searchType: searchType,
            keyword: keyword,
            status: status
        });

    };


    // 페이지 이동
    const handlePageChange = (page) => {

        setSearchParams({
            cpage: page,
            startDate: startDate,
            endDate: endDate,
            searchType: searchType,
            keyword: keyword,
            status: approverState
        });

    };


    // BUG-006: 공통 유틸(StatusBadge.js)로 라벨/톤 변환을 통일한다.
    const renderStatusBadge = (state) => {
        if (!state) return <span className="badge bg-secondary">-</span>;
        return <span className={`badge ${getStatusTone(state)}`}>{getStatusText(state)}</span>;
    };

    return (

        <main className="wf-container QueueList">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">승인 대기 목록</h1>
                    <p className="wf-page-description">부서원의 워케이션 신청 중 승인이 필요한 건을 확인합니다.</p>
                </div>
            </section>


            {/* 검색 영역 */}
            <div className="filter-area">


                {/* 상태 필터 */}
                <select
                    name="approverState"
                    value={approverState}
                    onChange={handleStatusChange}
                    className="status-filter"
                    id="approverState"
                >

                    <option value="">
                        전체
                    </option>

                    <option value="W">
                        대기
                    </option>

                    <option value="H">
                        보류
                    </option>

                    <option value="R">
                        검토
                    </option>

                </select>


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


            {/* 승인 대기 목록 */}
            <div>

                <table>

                    <thead>

                        <tr className="thead">

                            <th>번호</th>
                            <th>워케이션 제목</th>
                            <th>신청자</th>
                            <th>워케이션 기간</th>
                            <th>신청 일시</th>
                            <th>상태</th>

                        </tr>

                    </thead>


                    <tbody>

                        {dataList.length > 0 ? (

                            dataList.map((item) => (

                                <tr
                                    key={item.workcationNo}
                                    onClick={() =>
                                        navigate(
                                            `/approval/queue/detail/${item.workcationNo}`
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
                                        {item.createdAt?.replace(
                                            "T",
                                            " "
                                        ) || "-"}
                                    </td>


                                    <td>
                                        {renderStatusBadge(item.approverState)}
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

export default ApprovalQueueList;