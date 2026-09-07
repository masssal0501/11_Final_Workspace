import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LoginForm.css";
import { findEmployeeId } from "../api/employeeApi";

function FindIDForm() {

    const [empName, setEmpName] = useState("");
    const [email, setEmail] = useState("");

    const [maskedEmpId, setMaskedEmpId] = useState("");

    const [loading, setLoading] = useState(false);


    /*
     * 아이디 찾기
     */
    const handleFindId = async () => {

        if (!empName.trim()) {

            alert(
                "이름을 입력해주세요."
            );

            return;
        }

        if (!email.trim()) {

            alert(
                "이메일을 입력해주세요."
            );

            return;
        }


        try {

            setLoading(true);

            setMaskedEmpId("");


            const result =
                await findEmployeeId({
                    empName,
                    email
                });


            console.log(
                "아이디 찾기 결과:",
                result
            );


            /*
             * 백엔드에서
             * 마스킹된 아이디 반환
             */
            setMaskedEmpId(
                result.maskedEmpId
            );


        } catch (error) {

            console.error(
                "아이디 찾기 실패:",
                error
            );

            alert(
                error.response?.data?.message ||
                "입력하신 정보와 일치하는 계정을 찾을 수 없습니다."
            );

        } finally {

            setLoading(false);

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
                    아이디 찾기
                </div>


                {/* 이름 */}

                <div className="loginInputGroup">

                    <label>
                        이름
                    </label>

                    <input
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={empName}
                        onChange={(e) =>
                            setEmpName(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* 이메일 */}

                <div className="loginInputGroup">

                    <label>
                        이메일
                    </label>

                    <input
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                handleFindId();
                            }

                        }}
                    />

                </div>


                {/* 결과 */}

                {maskedEmpId && (

                    <div className="findResult">

                        <p>
                            회원님의 아이디는
                        </p>

                        <strong>
                            {maskedEmpId}
                        </strong>

                        <p>
                            입니다.
                        </p>

                    </div>

                )}


                {/* action */}

                <button
                    type="button"
                    onClick={handleFindId}
                    disabled={loading}
                >

                    {loading
                        ? "확인 중..."
                        : "확인"
                    }

                </button>


                {/* Find */}

                <div className="loginLinks">

                    <Link to="/login">
                        로그인
                    </Link>

                    <span>
                        |
                    </span>

                    <Link to="/login/findPW">
                        비밀번호 찾기
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default FindIDForm;