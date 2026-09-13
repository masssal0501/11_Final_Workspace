import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/LoginForm.css";
import { changePassword } from "../api/employeeApi";

function ChangePWForm({ loginUser, onLogin }) {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async () => {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = form;

        // 현재 비밀번호 입력 확인
        if (!currentPassword) {
            alert("현재 비밀번호를 입력해주세요.");
            return;
        }

        // 새 비밀번호 입력 확인
        if (!newPassword) {
            alert("변경할 비밀번호를 입력해주세요.");
            return;
        }

        // 비밀번호 확인
        if (!confirmPassword) {
            alert("변경할 비밀번호를 다시 입력해주세요.");
            return;
        }

        // 새 비밀번호 일치 확인
        if (newPassword !== confirmPassword) {
            alert("변경할 비밀번호가 일치하지 않습니다.");
            return;
        }

        // 현재 비밀번호와 새 비밀번호 동일 확인
        if (currentPassword === newPassword) {
            alert("현재 비밀번호와 다른 비밀번호를 입력해주세요.");
            return;
        }

        try {

            const result = await changePassword({
                currentPassword,
                newPassword,
            });

            alert("비밀번호가 정상적으로 변경되었습니다.");

            // BUG-08: window.location.href = "/login"으로 강제 새로고침하면
            // localStorage에 남아있던 이전 pwChgRequired:true가 그대로 다시
            // 읽혀 App.jsx의 비밀번호 변경 강제 화면 게이트에 걸려 대시보드로
            // 진입하지 못했다. 서버가 내려준 최신 정보(pwChgRequired:false 포함)로
            // 로그인 상태(React state + localStorage)를 갱신한 뒤, 새로고침 없이
            // 라우터로 이동한다 - accessToken 등 기존 로그인 정보는 그대로 유지한다.
            if (onLogin) {

                onLogin({
                    ...loginUser,
                    ...result,
                    pwChgRequired: false,
                });
            }

            navigate("/", { replace: true });

        } catch (error) {

            console.error(
                "비밀번호 변경 실패:",
                error
            );

            console.log("status:", error.response?.status);
            console.log("data:", error.response?.data);
            console.log("message:", error.response?.data?.message);

            alert(
                error.response?.data?.message ||
                "비밀번호 변경에 실패했습니다."
            );
        }
    };

    return (
        <div className="loginPage">

            <div className="loginForm">

                <div className="subtitle">
                    비밀번호 재설정
                </div>

                {/* 현재 비밀번호 */}
                <div className="loginInputGroup">
                    <label>현재 비밀번호</label>
                    <input
                        type="password"
                        name="currentPassword"
                        placeholder="현재 비밀번호를 입력하세요"
                        value={form.currentPassword}
                        onChange={handleChange}
                    />
                </div>

                {/* 변경할 비밀번호 */}
                <div className="loginInputGroup">
                    <label>변경할 비밀번호</label>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="변경할 비밀번호를 입력하세요"
                        value={form.newPassword}
                        onChange={handleChange}
                    />
                </div>

                {/* 변경할 비밀번호 재입력 */}
                <div className="loginInputGroup">
                    <label>변경할 비밀번호 확인</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="변경할 비밀번호를 다시 입력하세요"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {/* action */}
                <button type="button" onClick={handleSubmit}>
                    비밀번호 재설정
                </button>
            </div>

        </div>
    );
}

export default ChangePWForm;

