import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import TaskStatusBadge from "./TaskStatusBadge";

import '../styles/TaskList.css';

function TaskListComponent() {

    //실행구문
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();

    const searchCondition = searchParams.get("condition") || "all";
    const searchKeyword = searchParams.get("keyword") || "";
    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [dataList, setDataList] = useState([]);
    const [pageList, setPageList] = useState([]);

    useEffect(() => {

        if (searchKeyword === "") {
            //입력된 검색어가 없을 경우 -> 전체목록 조회
            selectTaskList();
        } else {
            //있을 경우 ->검색목록 조회
            searchTaskList();
        }
    }, [cpage, searchCondition, searchKeyword]);

    //이벤트 핸들러 함수
    //카테고리 변경 시
    const handleSelectChange = (e) => setSearchType(e.target.value);

    //검색어 입력시
    const handleChange = (e) => setKeyword(e.target.value);

    //검색 버튼 클릭시
    const handleClick = (e) => {
        e.preventDefault();

        setSearchParams({ cpage: 1, condition: searchType, keyword: keyword });
    };

    //API 통신 및 데이터 처리 함수
    const selectTaskList = async () => {
        try {

            //더미데이터 DB시 삭제
            const allDummyList = [
                { taskNo: 1, title: "샘플업무1", writer: "김철수", status: "업무 준비(0%)", date: "2026-08-01" },
                { taskNo: 2, title: "샘플업무2", writer: "이영희", status: "진행 중 (1 ~ 50%)", date: "2026-08-02" },
                { taskNo: 3, title: "샘플업무3", writer: "박민수", status: "진행 중 (51 ~ 99%)", date: "2026-08-03" },
                { taskNo: 4, title: "샘플업무4", writer: "최수진", status: "완료 요청(100%)", date: "2026-08-04" },
                { taskNo: 5, title: "샘플업무5", writer: "정우성", status: "업무 완료", date: "2026-08-05" },
                { taskNo: 6, title: "샘플업무6", writer: "김철수", status: "진행 중 (1 ~ 50%)", date: "2026-08-06" },
                { taskNo: 7, title: "샘플업무7", writer: "이영희", status: "업무 준비(0%)", date: "2026-08-07" },
                { taskNo: 8, title: "샘플업무8", writer: "박민수", status: "업무 완료", date: "2026-08-08" },
                { taskNo: 9, title: "샘플업무9", writer: "최수진", status: "진행 중 (51 ~ 99%)", date: "2026-08-09" },
                { taskNo: 10, title: "샘플업무10", writer: "정우성", status: "완료 요청(100%)", date: "2026-08-10" },
                { taskNo: 11, title: "샘플업무11", writer: "김철수", status: "진행 중 (51 ~ 99%)", date: "2026-08-11" },
                { taskNo: 12, title: "샘플업무12", writer: "이영희", status: "업무 준비(0%)", date: "2026-08-12" },
                { taskNo: 13, title: "샘플업무13", writer: "박민수", status: "완료 요청(100%)", date: "2026-08-13" },
                { taskNo: 14, title: "샘플업무14", writer: "최수진", status: "진행 중 (1 ~ 50%)", date: "2026-08-14" },
                { taskNo: 15, title: "샘플업무15", writer: "정우성", status: "업무 완료", date: "2026-08-15" },
                { taskNo: 16, title: "샘플업무16", writer: "김철수", status: "진행 중 (51 ~ 99%)", date: "2026-08-16" },
                { taskNo: 17, title: "샘플업무17", writer: "이영희", status: "업무 준비(0%)", date: "2026-08-17" }
            ];

            //id 기준 내림차순 정렬
            const sortedList = [...allDummyList].sort((a, b) => b.taskNo - a.taskNo);

            //페이지 당 5개
            const limit = 5;
            const totalCount = sortedList.length;
            const maxPage = Math.ceil(totalCount / limit);

            //현재 페이지 더미 자르기
            const startIndex = (cpage - 1) * limit;
            const pageData = sortedList.slice(startIndex, startIndex + limit);


            const dummyResponse = {
                data: {
                    list: pageData,
                    pi: { startPage: 1, endPage: maxPage, maxPage: maxPage }
                }
            }
            handleResponse(dummyResponse);

        } catch (error) {
            console.log("전체 목록 조회용 ajax 통신실패");
        }
    }

    //검색 목록 조회 API 함수
    const searchTaskList = async () => {
        try {
            const dummyResponse = {
                data: {
                    list: [
                        { taskNo: 3, title: `[${searchCondition}] ${searchKeyword} 검색결과`, writer: "작성자3", status: "진행 중 (1 ~ 50%)", date: "2026-08-19" }
                    ],
                    pi: { startPage: 1, endPage: 5, maxPage: 10 }
                }
            };
            handleResponse(dummyResponse);
        } catch (error) {
            console.log("검색용 ajax 통신 실패");
        }
    };

    //응답 데이터 처리 후 공통 함수(dataList, pageList)
    const handleResponse = (response) => {



        //1)tbody에 들어갈 td 생성
        const items = response.data.list;

        const trArr = items.map((item, index) => (
            <tr key={item.taskNo}
                onClick={() => navigate(`/task/detail/${item.taskNo}`)}>
                <td>{item.taskNo}</td>
                <td>{item.title}</td>
                <td>{item.writer}</td>
                <td className="text align-middle">
                    <TaskStatusBadge status={item.status} />
                </td>
                <td>{item.date}</td>

            </tr>
        ));

        setDataList(trArr);

        //pageList 후처리 페이징버튼
        const pageInfo = response.data.pi;
        const btnArr = [];

        //이전 버튼(<)
        btnArr.push(
            <button key="prev"
                className="page-btn"
                disabled={cpage === 1}
                onClick={() => cpage > 1 && setSearchParams({ cpage: cpage - 1, condition: searchCondition, keyword: searchKeyword })}
            >&lt;
            </button>
        );

        //페이지 버튼
        for (let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {
            btnArr.push(
                <button key={p}
                    className={`page-btn ${cpage === p ? 'active' : ''}`}
                    onClick={() => setSearchParams({ cpage: p, condition: searchCondition, keyword: searchKeyword })}
                >
                    {p}
                </button>
            )
        }

        //다음 버튼(NEXT)
        btnArr.push(
            <button key="next"
                className="page-btn"
                disabled={cpage === pageInfo.maxPage}
                onClick={() => cpage < pageInfo.maxPage && setSearchParams({ cpage: cpage + 1, condition: searchCondition, keyword: searchKeyword })}
            >&gt;
            </button>
        );
        setPageList(btnArr);
    }

    //return 구문
    return (
        <main className="wf-container">

            {/* 페이지 상단 */}
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">업무 관리</h1>
                    <p className="wf-page-description">등록된 업무 목록과 진행 현황을 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
                <div className="content-area">

                    <div className="task-btnset">

                        <form className="search-form">
                            {/*드롭다운*/}
                            <select
                                className="list-drop"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}>
                                <option value="all">전체</option>
                                <option value="title">제목</option>
                                <option value="writer">작성자</option>
                                <option value="status">진행도</option>
                            </select>

                            {/*검색창 */}
                            <input className="search-input"
                                type="text"
                                name="keyword"
                                placeholder="내용을 입력하세요"
                                value={keyword}
                                onChange={handleChange} />

                            {/*검색버튼 */}
                            <button className="search-btn"
                                type="submit"
                                onClick={handleClick}>검색
                            </button>
                        </form>

                    </div>

                    {/* 게시글 목록을 보여주는 리스트 영역 */}
                    <div className="wf-table-wrap">
                        <table className="task-list-table">
                            <thead>
                                <tr>
                                    <th width="150">번호</th>
                                    <th width="400">제목</th>
                                    <th width="200">작성자</th>
                                    <th width="150">진행도</th>
                                    <th width="200">작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataList.length > 0 ? dataList : (
                                    <tr className="wf-empty-row">
                                        <td colSpan={5}>조회된 업무가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이징바 영역 */}
                    <div className="paging-area">{pageList}</div>

                </div>
            </div>

        </main>

    )
}

//내보내기
export default TaskListComponent;