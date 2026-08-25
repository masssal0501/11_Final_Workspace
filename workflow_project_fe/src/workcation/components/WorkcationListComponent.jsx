import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import WorkcationScheduleComponent from "./WorkcationScheduleComponent";
import WorkcationItemComponent from "./WorkcationItemComponent";

import "../styles/WorkcationList.css";

function WorkcationListComponent() {

    //실행구문
    const navigate = useNavigate();//페이지 이동 함수

    const [keyword, setKeyword] = useState('');
    const [searchType, setSearchType] = useState("all");
    const [searchParams, setSearchParams] = useSearchParams();

    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const searchCondition = searchParams.get("condition") || "all";
    const searchKeyword = searchParams.get("keyword") || "";
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [dataList, setDataList] = useState([]);
    const [pageList, setPageList] = useState([]);

    useEffect(() => {
        selectWorkcationList();
    }, [cpage, searchCondition, searchKeyword]);

    const selectWorkcationList = async () => {
        try {
            //더미데이터 db연결시 삭제
            const allDummyList = {
                data: {
                    list: [
                        { workcationNo: 1, workcationTitle: "체험활동", regionName: "부산", empName: "김철수", createdAt: "2026-08-23", approverState: "신청보류" },
                        { workcationNo: 2, workcationTitle: "개발 워크숍", regionName: "강원도", empName: "이영희", createdAt: "2026-08-24", approverState: "승인" }
                    ], pi: { startPage: 1, endPage: 5, maxPage: 5 }
                }
            }
            handleResponse(allDummyList);
        } catch (error) {
            console.error(error);
        };
    }

    //응답 데이터 처리후 공통 함수(dataList, pageList)
    const handleResponse = (Response) => {

        //tbody에 넣을 td생성
        const items = Response.data.list;

        const trArr = items.map((item, index) => (
            <tr key={item.workcationNo}
                onClick={() => navigate(`/workcation/detail/${item.workcationNo}`)}>
                <td>{item.workcationNo}</td>
                <td>{item.workcationTitle}</td>
                <td>{item.regionName}</td>
                <td>{item.empName}</td>
                <td>{item.createdAt}</td>
                <td>{item.approverState}</td>
            </tr>
        ))

        setDataList(trArr);

        //pageList 
        const pageInfo = Response.data.pi;
        const btnArr = [];

        //이전버튼
        btnArr.push(
            <button key="prev"
                className="page-btn"
                disabled={cpage === 1}
                onClick={() => cpage > 1 && setSearchParams({ cpage: cpage - 1, condition: searchCondition, keyword: setKeyword })}>
                &lt;
            </button>
        )

        //페이지버튼
        for (let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {
            btnArr.push(
                <button
                    key={p}
                    className={`page-btn ${cpage === p ? `active` : ''}`}
                    onClick={() => setSearchParams({ cpage: p, condition: searchCondition, keyword: setKeyword })}>
                    {p}
                </button >
            )
        }

        //다음버튼
        btnArr.push(
            <button
                key="next"
                disabled={cpage === pageInfo.maxPage}
                onClick={() => cpage < pageInfo.maxPage && setSearchParams({ cpage: cpage + 1, condition: searchCondition, keyword: searchKeyword })}>
                &gt;
            </button>
        )
        setPageList(btnArr);

    }
    //return구문
    return (
        <div align="center" className="content-area">
            <h2>워케이션 신청 목록</h2>

            <div className="workcation-btnSet">

                {/*일정관리 */}
                <button className="skedule-btn"
                    onClick={() => setIsScheduleOpen(true)}>
                    일정관리
                </button>
                {/**상단에서 import 한 컴포넌트를 불러오기 */}
                {isScheduleOpen && (
                    <WorkcationScheduleComponent onClose={() => setIsScheduleOpen(false)} />
                )}

                {/**지역과 상세지역 드롭다운 호출 */}
                <WorkcationItemComponent />

                {/**상태 드롭다운 */}
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

            {/**신청하기 */}
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
                <tbody>{dataList}</tbody>
            </table>
            <br /><br />

            <div align="center" className="paging-area">
                {pageList}
            </div>
        </div>

    );
}

//내보내기
export default WorkcationListComponent