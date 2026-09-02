import { useState } from "react";

import "../style/ApprovalHistoryList.css";

function ApprovalHistoryList () {

    // const [dataList, setDataList] = useState([]);

    // 임시 데이터
    const [dataList, setDataList] = useState([
    {
        workcationNo: 1,
        workcationTitle: "제주 워케이션",
        employee: {
            empName: "김규민"
        },
        startAt: "2026-09-01",
        endAt: "2026-09-05",
        approver: {
            empName: "관리자"
        },
        approverAt: "2026-08-28 14:30"
    },
    {
        workcationNo: 2,
        workcationTitle: "부산 워케이션",
        employee: {
            empName: "홍길동"
        },
        startAt: "2026-09-10",
        endAt: "2026-09-14",
        approver: {
            empName: "이관리"
        },
        approverAt: "2026-08-29 10:20"
    },
    {
        workcationNo: 3,
        workcationTitle: "강릉 워케이션",
        employee: {
            empName: "김철수"
        },
        startAt: "2026-09-15",
        endAt: "2026-09-19",
        approver: {
            empName: "박관리"
        },
        approverAt: "2026-08-30 16:45"
    },
    {
        workcationNo: 4,
        workcationTitle: "여수 워케이션",
        employee: {
            empName: "이영희"
        },
        startAt: "2026-09-20",
        endAt: "2026-09-24",
        approver: {
            empName: "관리자"
        },
        approverAt: "2026-08-31 09:15"
    },
    {
        workcationNo: 5,
        workcationTitle: "제주 한달살이 워케이션",
        employee: {
            empName: "박민수"
        },
        startAt: "2026-10-01",
        endAt: "2026-10-07",
        approver: {
            empName: "이관리"
        },
        approverAt: "2026-09-01 11:40"
    }
]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSearch = () => {
        if (startDate && endDate && startDate > endDate) {
            alert("시작일은 종료일보다 빠르거나 같아야 합니다.");
            return;
        }
    }

    return (
        <div className="historyList">
            <h2 align="center">승인 이력 조회</h2>
            <hr />
            <div className="date-filter">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}/>
                <span>~</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}/>
                <button onClick={handleSearch}>검색</button>
            </div>

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
                            dataList.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.workcationNo}</td>
                                    <td>{item.workcationTitle}</td>
                                    <td>{item.employee?.empName}</td>
                                    <td>{item.startAt} ~ {item.endAt}</td>
                                    <td>{item.approver?.empName}</td>
                                    <td>{item.approverAt}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} align="center">
                                    조회된 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <br /><br />
            {/* *페이징 영역
            <div align="center" className="paging-area">
                {pageList}
            </div> */}

            {/* 임시 페이징 영역 */}
            <div align="center" className="paging-area">
                <button>1</button>
                <button>2</button>
                <button>3</button>
            </div>
            
        </div>
    );
}
export default ApprovalHistoryList;