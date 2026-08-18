import { useState, useNavigate } from "react";

import '../css/TaskList.css';

function TaskListComponent() {

    //실행구문
    const [keyword, setKeyword] = useState('');

    const handleChange = (e) => setKeyword(e, EventTarget.value);
    const handleClick = (e) => {

        e.preventDefault();
        console.log("검색어 : ", keyword);
    }

    const navigate = (path) => console.log(path + "로 이동");

    const dataList = (
        <tr>
            <td>1</td>
            <td>제목</td>
            <td>작성자</td>
            <td>1</td>
            <td>0000-00-00</td>
            <td></td>
        </tr>
    );

    const pageList = <span>[1]</span>;


    //return 구문
    return (
        <div>
            <h2 align="center">근무 목록 조회</h2>
            <br /><br />

            {/* 검색창 영역 */}
            <div align="center" className="search-area">
                <form>
                    <input type="text" name="keyword" placeholder="내용을 입력하세요"
                        value={keyword} onChange={handleChange} />
                    <button type="submit"
                        onClick={handleClick}>검색</button>
                </form>
            </div>
            <br /><br />


            {/* 버튼 영역 */}
            <div align="right" >
                <button className="btn btn-outline-secondary btn-sm"
                    onClick={() => { navigate("/task/enrollForm"); }}>
                    글작성
                </button>
            </div>
            <br />


            {/* 게시글 목록을 보여주는 리스트 영역 */}
            <table className="list-area table table-hover">
                <thead>
                    <tr>
                        <th width="150">번호</th>
                        <th width="500">제목</th>
                        <th width="200">작성자</th>
                        <th width="150">진행도</th>
                        <th width="200">작성일</th>
                        <th width="50"></th>
                    </tr>
                </thead>
                <tbody>{dataList}</tbody>
            </table>
            <br></br>


            {/* 페이징바 영역 */}
            <div align="center" className="paging-area">{pageList}</div>
            <br /><br />

        </div>

    )
}

//내보내기
export default TaskListComponent;