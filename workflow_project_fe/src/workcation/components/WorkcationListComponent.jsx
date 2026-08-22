import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


import "../styles/WorkcationList.css";

const WORKCATION_DATA = {
    "강원도": ["강릉시", "속초시", "양양군", "춘천시", "평창군"],
    "부산": ["해운대구", "달맞이길", "수영구", "부산진구", "중구"],
    "제주도": ["서귀포시", "제주시"]
}

function WorkcationListComponent() {

    //실행구문
    const navigate = useNavigate();//페이지 이동 함수

    const [keyWord, setKeyword] = useState('');
    const [searchType, setSearchType] = useState("all");
    const [searchParams, setSearchParams] = useSearchParams();

    const searchCondition = searchParams.get("condition") || "all";
    const searchKeyword = searchParams.get("keyword") || "";
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [selectedSido, setSelectedSido] = useState("");
    const [selectedgugun, setSelectedgugun] = useState("");

    const [dataList, setDataList] = useState([]);
    const [pageList, setPageList] = useState([]);

    //시/도 변경 이벤트 핸들러
    const handleSidoChange = (e) => {
        const sido = e.target.value;
        setSelectedSido(sido);
        setSelectedgugun("");//시/도에 따라 하위 값 초기화
    };

    //응답 데이터 처리후 공통 함수(dataList, pageList)
    const handleResponse = (Response) => {

        //tbody에 넣을 td생성
        const items = Response.data.list;

        const trArr = items.map((item, index) => (
            <tr key={item.workcationNo}
                onClick={() => useNavigate(`/workcation/detail/${item.workcationNo}`)}>
                <td id={item.workcationNo}></td>
                <td id={item.regionName}></td>
                <td id={item.empNo}></td>
                <td id={item.createdAt}></td>
                <td id={item.approverState}></td>
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
                onClick={() => cpage > 1 && setSearchParams({ cpage: cpage - 1, condition: searchCondition, keyWord: setKeyword })}>
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
                onClick={() => cpage < pageInfo.maxPage && setSearchParams({ cpage: p, condition: searchCondition, keyword: setKeyword })}>
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
                <button className="skedule-btn">
                    일정관리
                </button>

                <div className="drop-group">
                    {/**시/도 드롭다운 */}
                    <select className="sido-drop"
                        value={selectedSido}
                        onChange={handleSidoChange} >
                        <option value="">시/도 선택</option>
                        {Object.keys(WORKCATION_DATA).map((sido) => (
                            <option key={sido} value={sido}>
                                {sido}
                            </option>
                        ))}
                    </select>

                    {/**군/구 드롭다운 */}
                    <select
                        className="gugun-drop"
                        value={selectedgugun}
                        onChange={(e) => setSelectedgugun(e.target.value)}
                        disabled={!selectedSido}>
                        <option value="">구/군 선택</option>
                        {selectedSido && WORKCATION_DATA[selectedSido].map((gugun) => (
                            <option key={gugun} value={gugun}>
                                {gugun}
                            </option>
                        ))}
                    </select>

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
                    <button>신청</button>
                </div>
            </div>



            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>지역</th>
                        <th>신청자</th>
                        <th>신청일</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>{dataList}</tbody>
            </table>
            <br /><br />

            <div align="center" className="paging-area"></div>

        </div>

    )
}

//내보내기
export default WorkcationListComponent;