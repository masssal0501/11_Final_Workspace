import { Link } from "react-router-dom";

import "../styles/Header.css";

// 헤더를 나타내는 컴포넌트 - 모든 페이지 상단에 위치
// (기존의 menubar.jsp 에 대응됨)
function Header() {

    // 실행할 구문

    // return 구문
    return (
        <div>
            <h1 align="center">Welcome to React Manager</h1>

            <br/><br/>

            <div className="navi">
                <div>
                    <Link to="/">HOME</Link>
                </div>
                <div>
                    <Link to="/member/list">회원관리</Link>
                </div>
                <div>
                    <Link to="/notice/list">공지사항관리</Link>
                </div>
                <div>
                    <Link to="/board/list">일반게시판관리</Link>
                </div>
            </div>
        </div>
    );
}

// 내보내기
export default Header;

/*
 *  * 브라우저 창에 보이는 URL 주소 VS 백엔드와 통신할 때 쓰이는 URL 주소
 *  - 브라우저 창에 보이는 URL 주소 : 예전에 쓴대로 도메인/기능 이런식으로 명시적으로 작성
 *                                  사용자 눈에 보이는 주소임
 *    예) /member/list, /member/detail/x, /member/enrollForm 등
 *  - 백엔드와 통신할 때 쓰이는 URL 주소 : REST API 형식으로 작성
 *                                       사용자 눈에 안보이는 주소임
 *    예) /members, /members/x 등
 */