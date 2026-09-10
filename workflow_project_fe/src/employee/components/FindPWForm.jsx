import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LoginForm.css";
import {
    requestPasswordReset,
    verifyPasswordResetCode,
} from "../api/employeeApi";

function FindPWForm() {

    // 1단계(정보 입력) / 2단계(인증번호 입력)
    const [step, setStep] = useState(1);

    const [empId, setEmpId] = useState("");
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);


    /*
     * 1단계: 인증번호 발송 요청
     */
    const handleRequestCode = async () => {

        if (!empId.trim()) {

            alert(
                "아이디를 입력해주세요."
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

            await requestPasswordReset({
                empId,
                email,
            });

            alert(
                "입력하신 이메일로 인증번호를 발송했습니다."
            );

            setStep(2);

        } catch (error) {

            console.error(
                "인증번호 발송 실패:",
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


    /*
     * 2단계: 인증번호 확인 → 임시 비밀번호 발급
     */
    const handleVerifyCode = async () => {

        if (!verificationCode.trim()) {

            alert(
                "인증번호를 입력해주세요."
            );

            return;
        }

        try {

            setLoading(true);

            await verifyPasswordResetCode({
                empId,
                verificationCode,
            });

            setDone(true);

        } catch (error) {

            console.error(
                "인증번호 확인 실패:",
                error
            );

            alert(
                error.response?.data?.message ||
                "인증번호가 올바르지 않거나 만료되었습니다."
            );

        } finally {

            setLoading(false);
        }
    };


    if (done) {

        return (
            <div className="loginPage">

                <div className="loginForm">

                    <div className="loginLogo">
                        <span className="loginLogoMark">W</span>
                        <span className="loginLogoText">
                            WorkFlow
                        </span>
                    </div>

                    <div className="subtitle">
                        비밀번호 찾기
                    </div>

                    <div className="findResult">
                        <p>
                            입력하신 이메일로
                        </p>
                        <strong>
                            임시 비밀번호
                        </strong>
                        <p>
                            를 발송했습니다.
                        </p>
                    </div>

                    <div className="loginLinks">
                        <Link to="/login">
                            로그인
                        </Link>
                    </div>

                </div>

            </div>
        );
    }

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

                {step === 1 && (

                    <>
                        {/* 아이디 */}
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

                        {/* email */}
                        <div className="loginInputGroup">
                            <label>이메일</label>
                            <input
                                type="email"
                                placeholder="이메일을 입력하세요"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRequestCode();
                                    }
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleRequestCode}
                            disabled={loading}
                        >
                            {loading
                                ? "발송 중..."
                                : "인증번호 받기"
                            }
                        </button>
                    </>
                )}

                {step === 2 && (

                    <>
                        <div className="loginInputGroup">
                            <label>인증번호</label>
                            <input
                                type="text"
                                placeholder="이메일로 받은 인증번호를 입력하세요"
                                value={verificationCode}
                                onChange={(e) =>
                                    setVerificationCode(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleVerifyCode();
                                    }
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={loading}
                        >
                            {loading
                                ? "확인 중..."
                                : "비밀번호 재설정"
                            }
                        </button>
                    </>
                )}

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
}

export default FindPWForm;
