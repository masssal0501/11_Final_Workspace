import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getTaskList } from "../api/Task";

import "../styles/TaskList.css";

function TaskListComponent() {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const cpage = parseInt(searchParams.get("cpage")) || 1;
    const searchCondition = searchParams.get("condition") || "all";
    const searchKeyword = searchParams.get("keyword") || "";

    const [searchType, setSearchType] = useState(searchCondition);
    const [keyword, setKeyword] = useState(searchKeyword);

    const [taskList, setTaskList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        selectTaskList();
    }, [cpage, searchCondition, searchKeyword]);

    // 목록
    const selectTaskList = async () => {
        try {
            const response = await getTaskList({
                cpage,
                condition: searchCondition,
                keyword: searchKeyword
            });

            setTaskList(response.content || []);
            setTotalPages(response.totalPages || 1);

        } catch (error) {
            console.error("업무 목록 조회 실패", error);
            setTaskList([]);
        }
    };

    // 검색
    const handleSearch = (e) => {
        e.preventDefault();

        setSearchParams({
            cpage: 1,
            condition: searchType,
            keyword
        });
    };

    // 페이지
    const changePage = (page) => {
        setSearchParams({
            cpage: page,
            condition: searchCondition,
            keyword: searchKeyword
        });
    };

    return (
        <div className="content-area">

            <h2 align="center">업무 목록 조회</h2>

            <div className="task-btnset">
                <form
                    className="search-form"
                    onSubmit={handleSearch}
                >
                    <select
                        className="list-drop"
                        value={searchType}
                        onChange={(e) =>
                            setSearchType(e.target.value)
                        }
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                    </select>

                    <input
                        className="search-input"
                        type="text"
                        placeholder="내용을 입력하세요"
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                    />

                    <button
                        className="search-btn"
                        type="submit"
                    >
                        검색
                    </button>
                </form>
            </div>

            <table className="list-area">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>워케이션 제목</th>
                        <th>작성자</th>
                        <th>전체 진행도</th>
                        <th>작성일</th>
                    </tr>
                </thead>

                <tbody>
                    {taskList.map(item => (
                        <tr
                            key={item.workcationNo}
                            onClick={() =>
                                navigate(`/task/detail/${item.workcationNo}`)
                            }>
                            <td>{item.workcationNo}</td>
                            <td>{item.workcationTitle}</td>
                            <td>{item.writer}</td>
                            <td>{item.overallProgress}%</td>
                            <td>{item.createdAt ? item.createdAt.substring(0, 10) : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {taskList.length === 0 && (
                <div className="empty-message">
                    조회된 업무가 없습니다.
                </div>
            )}

            <div className="paging-area">

                <button
                    className="page-btn"
                    disabled={cpage === 1}
                    onClick={() => changePage(cpage - 1)}
                >
                    &lt;
                </button>

                {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                ).map(page => (
                    <button
                        key={page}
                        className={
                            `page-btn ${cpage === page ? "active" : ""}`
                        }
                        onClick={() => changePage(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="page-btn"
                    disabled={cpage === totalPages}
                    onClick={() => changePage(cpage + 1)}
                >
                    &gt;
                </button>

            </div>
        </div>
    );
}

export default TaskListComponent;