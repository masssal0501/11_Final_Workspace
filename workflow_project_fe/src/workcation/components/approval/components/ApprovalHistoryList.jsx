import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../style/ApprovalHistoryList.css";
import { ApprovalApi } from "../api/ApprovalApi";

function ApprovalHistoryList() {

    const [dataList, setDataList] = useState([]);
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 승인 이력 목록 조회
    useEffect(() => {

        ApprovalApi.getApprovalList(1)
            .then((data) => {

                console.log("승인 이력 조회 결과:", data);

                setDataList(data.list);

            })
            .catch((error) => {

                console.error("승인 이력 조회 실패:", error);

            });

    }, []);


    const handleSearch = () => {

        if (startDate && endDate && startDate > endDate) {
            alert("시작일은 종료일보다 빠르거나 같아야 합니다.");
            return;
        }

    };


    return (
        <div className="historyList">

            <h2 align="center">승인 이력 조회</h2>

            <hr />

            <div className="date-filter">

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <span>~</span>

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <button onClick={handleSearch}>
                    검색
                </button>

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

                            dataList.map((item) => (

                                <tr
                                    key={item.workcationNo}
                                    onClick={() => navigate(`/approval/history/detail/${item.workcationNo}`)}
                                    style={{ cursor: "pointer" }}>

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
                                        {item.startAt?.replace("T", " ")} ~ {item.endAt?.replace("T", " ")}
                                    </td>

                                    <td>
                                        {item.approver?.empName || "-"}
                                    </td>

                                    <td>
                                        {item.approvetAt?.replace("T", " ") || "-"}
                                    </td>

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

        </div>
    );
}

export default ApprovalHistoryList;