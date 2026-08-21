import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginForm.css";
import { login } from "../api/employeeApi";

function LoginForm() {

    const [empId, setEmpId] = useState("");
    const [password, setPassword] = useState("");

        const handleLogin = async () => {

        if (!empId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }

        if (!password) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        try {

            const result = await login({
                empId,
                password
            });

            console.log(
                "로그인 성공:",
                result
            );

            // JWT 저장
            localStorage.setItem(
                "accessToken",
                result.accessToken
            );

            // 사용자 정보 저장
            localStorage.setItem(
                "user",
                JSON.stringify({
                    empNo: result.empNo,
                    empId: result.empId,
                    empName: result.empName,
                    authCode: result.authCode,
                    depId: result.depId,
                    jobCode: result.jobCode
                })
            );

            alert(
                `${result.empName}님 환영합니다.`
            );

            navigate("/");

        } catch (error) {

            console.error(
                "로그인 실패:",
                error
            );

            alert(
                error.response?.data?.message ||
                "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }
    };

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
                        value={empId}
                        onChange={(e) =>
                            setEmpId(e.target.value)
                        }
                    />
                </div>

                {/* Password */}
                <div className="loginInputGroup">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleLogin();
                            }
                        }}
                    />
                </div>

                {/* Remember ID */}
                <label className="rememberId">
                    <input type="checkbox" />
                    <span>아이디 저장</span>
                </label>

                {/* Login */}
                <button type="button" onClick={handleLogin}>
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