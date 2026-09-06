import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/employeeApi"; // 경로 상황에 맞게 수정 필요
import "../styles/LoginForm.css";

function LoginForm() {
    const [empId, setEmpId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const loginData = { empId, password };
            const response = await login(loginData);

            // 서버에서 받은 JWT 토큰 로컬 스토리지에 저장
            localStorage.setItem("accessToken", response.accessToken);

            alert("로그인 성공!");
            navigate("/"); // 로그인 성공 후 이동할 메인 페이지 경로
        } catch (error) {
            console.error("로그인 실패:", error);
            alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div className="loginPage">
            <form className="loginForm" onSubmit={handleLogin}>

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
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="loginInputGroup">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Remember ID */}
                <label className="rememberId">
                    <input type="checkbox" />
                    <span>아이디 저장</span>
                </label>

                {/* Login */}
                <button type="submit">
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

            </form>
        </div>
    );
}

export default LoginForm;