import { Link } from "react-router-dom";
import "../styles/LoginForm.css";

function FindPWForm() {

    return (
        <div className="loginPage">

            <div className="loginForm">

                {/* Logo */}
                <div className="loginLogo">
                    <span className="loginLogoMark">W</span>
                    <span className="loginLogoText">
                        WorkFlow
                    </span>
                </div>

                <div className="subtitle">
                    비밀번호 찾기
                </div>

                {/* 아이디 */}
                <div className="loginInputGroup">
                    <label>아이디</label>
                    <input
                        type="text"
                        placeholder="이름을 입력하세요"
                    />
                </div>

                {/* email */}
                <div className="loginInputGroup">
                    <label>이메일</label>
                    <input
                        type="email"
                        placeholder="이메일을 입력하세요"
                    />
                </div>

                {/* action */}
                <button type="button">
                    비밀번호 재설정
                </button>

                {/* Find */}
                <div className="loginLinks">
                    <Link to="/login">
                        로그인
                    </Link>

                    <span>|</span>

                    <Link to="/login/findID">
                        아이디 찾기
                    </Link>
                </div>

            </div>

        </div>
    );

    // return(
    //     <div className="loginForm">
    //         <div className="subtitle">비밀번호 찾기</div>
    //         아이디 : <input type="text" /> <br />
    //         사번 : <input type="text" /> <br />
    //         이메일 : <input type="email" /> <br />
            
    //         <button>비밀번호 재설정</button> <br />
    //         <Link to="/login">로그인</Link> / <Link to="/login/findID">아이디 찾기</Link>
    //     </div>
    // )
}

export default FindPWForm;

