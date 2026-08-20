import { Link } from "react-router-dom";

import "../styles/Header.css";

// 헤더를 나타내는 컴포넌트 - 모든 페이지 상단에 위치
// (기존의 menubar.jsp 에 대응됨)
function Header() {

    // 실행할 구문

    // return 구문
    return (
        <div>
            <h1 align="center">WorkFlow</h1>

            <br/><br/>

            <div className="navi">
                <div>
                    <Link to="/">HOME</Link>
                </div>
                <div>
                    <Link to="/placeInfo/list">여행지역/정보</Link>
                </div>
                <div>
                    <Link to="/task/list">업무</Link>
                </div>
                <div>
                    <Link to="/cost/list">비용/정산</Link>
                </div>
                <div>
                    <Link to="/workcation/list">워케이션</Link>
                </div>
                <div>
                    <Link to="/notice/list">공지사항</Link>
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