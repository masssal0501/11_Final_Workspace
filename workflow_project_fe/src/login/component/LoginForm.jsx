import { Link } from "react-router-dom";
import "../styles/LoginForm.css";

function LoginForm() {

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
                    로그인
                </div>

                {/* ID */}
                <div className="loginInputGroup">
                    <label>아이디</label>
                    <input
                        type="text"
                        placeholder="아이디를 입력하세요"
                    />
                </div>

                {/* Password */}
                <div className="loginInputGroup">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                {/* Remember ID */}
                <label className="rememberId">
                    <input type="checkbox" />
                    <span>아이디 저장</span>
                </label>

                {/* Login */}
                <button type="button">
                    로그인
                </button>

                {/* Find */}
                <div className="loginLinks">
                    <Link to="findID">
                        아이디 찾기
                    </Link>

                    <span>|</span>

                    <Link to="findPW">
                        비밀번호 찾기
                    </Link>
                </div>

            </div>

        </div>
    );
}

export default LoginForm;