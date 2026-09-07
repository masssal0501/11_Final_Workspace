import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../style/ApprovalHistoryList.css";
import { ApprovalApi } from "../api/ApprovalApi";

function ApprovalQueueList () {

    const [dataList, setDataList] = useState([]);

    const [pageInfo, setPageInfo] = useState(null);

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const cpage =
        parseInt(searchParams.get("cpage")) || 1;


    // 승인 이력 목록 조회
    useEffect(() => {

        ApprovalApi.getApprovalQueueList(cpage)
            .then((data) => {

                console.log(
                    "승인 대기 목록 조회 결과:",
                    data
                );
                console.log("페이지 정보:", data.pageInfo);

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

    }, [cpage]);


    // 검색
    const handleSearch = () => {

        if (startDate && endDate && startDate > endDate) {

            alert(
                "시작일은 종료일보다 빠르거나 같아야 합니다."
            );

            return;
        }

        // 날짜 검색 기능은 추후 백엔드 조건 추가 후 연결
        console.log(
            "검색 기간:",
            startDate,
            "~",
            endDate
        );
    };


    // 페이지 이동
    const handlePageChange = (page) => {

        setSearchParams({
            cpage: page
        });

    };
return (

        <div className="QueueList">

            <h2 align="center">
                승인 대기 목록
            </h2>

            <hr />


            {/* 날짜 검색 */}
            <div className="date-filter">

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                        setStartDate(e.target.value)
                    }
                />

                <span>~</span>

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                        setEndDate(e.target.value)
                    }
                />

                <button onClick={handleSearch}>
                    검색
                </button>

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
                                            `/workcation/detail/${item.workcationNo}`
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
                                        {item.approverState}
                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan={6}
                                    align="center"
                                >
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

        </div>
    );
}
export default ApprovalQueueList