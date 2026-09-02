import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginForm.css";
import { login } from "../api/employeeApi";

function LoginForm({ onLogin }) {

    const navigate = useNavigate();

    const [empId, setEmpId] = useState("");
    const [password, setPassword] = useState("");

    // 아이디 저장 여부
    const [rememberId, setRememberId] = useState(false);


    /*
     * ========================================
     * 저장된 아이디 불러오기
     * ========================================
     */
    useEffect(() => {

        const savedId =
            localStorage.getItem("savedEmpId");

        if (savedId) {

            setEmpId(savedId);

            setRememberId(true);

        }

    }, []);


    /*
     * ========================================
     * 로그인
     * ========================================
     */
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


            /*
             * ========================================
             * 아이디 저장
             * ========================================
             */
            if (rememberId) {

                localStorage.setItem(
                    "savedEmpId",
                    empId
                );

            } else {

                localStorage.removeItem(
                    "savedEmpId"
                );

            }


            /*
             * App의 loginUser 상태 변경
             */
            onLogin(result);


            /*
             * JWT 저장
             */
            localStorage.setItem(
                "accessToken",
                result.accessToken
            );


            /*
             * 사용자 정보 저장
             */
            localStorage.setItem(
                "user",
                JSON.stringify({

                    empNo:
                        result.empNo,

                    empId:
                        result.empId,

                    empName:
                        result.empName,

                    authCode:
                        result.authCode,

                    depId:
                        result.depId,

                    jobCode:
                        result.jobCode,

                    pwChgRequired:
                        result.pwChgRequired,

                })
            );


            /*
             * 환영 메시지
             */
            alert(
                `${result.empName}님 환영합니다.`
            );


            /*
             * ========================================
             * 최초 로그인 / 비밀번호 변경 필요
             * ========================================
             */
            if (
                result.pwChgRequired === true ||
                result.pwChgRequired === "true"
            ) {

                alert(
                    "최초 로그인입니다.\n비밀번호를 변경해주세요."
                );

                navigate("/changePW");

                return;
            }


            /*
             * ========================================
             * 권한별 페이지 이동
             * ========================================
             */
            switch (result.authCode) {

                case "ADMIN":

                    navigate("/dashboard");

                    break;


                case "MANAGER":

                    navigate("/dashboard");

                    break;


                case "STAFF":

                    navigate("/dashboard");

                    break;


                default:

                    alert(
                        "사용자 권한을 확인할 수 없습니다."
                    );

                    localStorage.removeItem(
                        "accessToken"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    navigate("/login");

                    return;
            }


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

                    <span className="loginLogoMark">
                        W
                    </span>

                    <span className="loginLogoText">
                        WorkFlow
                    </span>

                </div>


                <div className="subtitle">
                    로그인
                </div>


                {/* ID */}

                <div className="loginInputGroup">

                    <label>
                        아이디
                    </label>

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

                    <label>
                        비밀번호
                    </label>

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

                    <input
                        type="checkbox"
                        checked={rememberId}
                        onChange={(e) =>
                            setRememberId(
                                e.target.checked
                            )
                        }
                    />

                    <span>
                        아이디 저장
                    </span>

                </label>


                {/* Login */}

                <button
                    type="button"
                    onClick={handleLogin}
                >
                    로그인
                </button>


                {/* Find */}

                <div className="loginLinks">

                    <Link to="findID">
                        아이디 찾기
                    </Link>

                    <span>
                        |
                    </span>

                    <Link to="findPW">
                        비밀번호 찾기
                    </Link>

                </div>


            </div>

        </div>

    );
}

export default LoginForm;

