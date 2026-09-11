import "../styles/EmployeeEnrollFormComponent.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee, checkEmpIdDuplicate } from "../api/employeeApi";

function EmployeeEnrollFormComponent() {
    const navigate = useNavigate();

    // 숫자만 입력되도록 제한하는 함수
    const handlePhoneChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value.replace(/[^0-9]/g, ""),
        });
    };

    // 아이디 중복 확인
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isIdAvailable, setIsIdAvailable] = useState(false);

    const [form, setForm] = useState({
        empId: "",
        empName: "",
        phone1: "",
        phone2: "",
        phone3: "",
        email: "",
        address: "",
        depId: "",
        authCode: "",
        jobCode: "",
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });

        // 아이디가 변경되면 기존 중복확인 결과 무효화
        if (name === "empId") {
            setIsIdChecked(false);
            setIsIdAvailable(false);
        }
    };

    // 중복 확인 함수
    const handleCheckId = async () => {

        const empId = form.empId.trim();

        if (!empId) {

            alert("아이디를 입력해주세요.");
            return;
        }

        try {

            const duplicated =
                await checkEmpIdDuplicate(empId);

            setIsIdChecked(true);

            if (duplicated) {

                setIsIdAvailable(false);

                alert(
                    "이미 사용 중인 아이디입니다."
                );

            } else {

                setIsIdAvailable(true);

                alert(
                    "사용 가능한 아이디입니다."
                );
            }

        } catch (error) {

            console.error(
                "아이디 중복 확인 실패:",
                error
            );

            alert(
                "아이디 중복 확인에 실패했습니다."
            );
        }
    };

    // 등록 함수
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!isIdChecked) {

            alert(
                "아이디 중복확인을 해주세요."
            );

            return;
        }

        if (!isIdAvailable) {

            alert(
                "사용할 수 없는 아이디입니다."
            );

            return;
        }

        // 전화번호 조합
        const phone =
            `${form.phone1}-${form.phone2}-${form.phone3}`;

        const submitData = {
            empId: form.empId,
            empName: form.empName,
            phone: phone,
            email: form.email,
            address: form.address,
            depId: form.depId,
            authCode: form.authCode,
            jobCode: form.jobCode,
        };


        try {

            const result =
                await createEmployee(submitData);

            console.log(
                "계정 생성 성공:",
                result
            );

            alert(
                "직원 계정이 정상적으로 생성되었습니다."
            );

        } catch (error) {

            console.error(
                "계정 생성 실패:",
                error
            );

            alert(
                error.response?.data?.message ||
                "계정 생성에 실패했습니다."
            );
        }
    };

    

    return(
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">직원 등록</h1>
                    <p className="wf-page-description">새로운 직원 계정을 생성합니다. 아이디는 등록 전 중복확인이 필요합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="enrollForm">
            <form onSubmit={handleSubmit}>

                <table>
                    <tbody>
                        <tr>
                            <th>아이디<span className="wf-required">*</span></th>
                            <td>
                                <div className="idInputGroup">
                                    <input type="text" name="empId" value={form.empId} onChange={handleChange} required/>
                                    <button type="button" onClick={handleCheckId}>중복확인</button>
                                </div>
                                {isIdChecked && (
                                    <p className={isIdAvailable ? "wf-help-text" : "wf-error-text"}>
                                        {isIdAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."}
                                    </p>
                                )}
                            </td>
                            <th>직책<span className="wf-required">*</span></th>
                            <td>
                                <select name="authCode" value={form.authCode} onChange={handleChange} required>
                                    <option value="" disabled hidden>선택</option>
                                    <option value="STAFF">평사원</option>
                                    <option value="MANAGER">부서장</option>
                                    <option value="ADMIN">관리자</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>이름<span className="wf-required">*</span></th>
                            <td><input type="text" name="empName" value={form.empName} onChange={handleChange} required /></td>
                            <th>부서<span className="wf-required">*</span></th>
                            <td>
                                <select name="depId" value={form.depId} onChange={handleChange} required>
                                    <option value="" disabled hidden>선택</option>
                                    <option value="D1">기획</option>
                                    <option value="D2">디자인</option>
                                    <option value="D3">FE 개발</option>
                                    <option value="D4">BE 개발</option>
                                    <option value="D5">데이터</option>
                                    <option value="D6">QA</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>연락처<span className="wf-required">*</span></th>
                            <td>
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone1"
                                    maxLength={3}
                                    value={form.phone1}
                                    onChange={handlePhoneChange}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone2"
                                    maxLength={4}
                                    value={form.phone2}
                                    onChange={handlePhoneChange}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone3"
                                    maxLength={4}
                                    value={form.phone3}
                                    onChange={handlePhoneChange}
                                />
                            </td>
                            <th>직위<span className="wf-required">*</span></th>
                            <td>
                                <select name="jobCode" id="jobCode" value={form.jobCode} onChange={handleChange} required>
                                    <option value="" disabled hidden>선택</option>
                                    <option value="J1">사원</option>
                                    <option value="J2">대리</option>
                                    <option value="J3">과장</option>
                                    <option value="J4">차장</option>
                                    <option value="J5">부장</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>이메일<span className="wf-required">*</span></th>
                            <td colSpan={3}>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required />
                            </td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td colSpan={3}>
                                <input type="text" name="address" value={form.address} onChange={handleChange} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>돌아가기</button>
                <button type="submit" className="btnPrimary">직원 등록</button>

            </form>
            </div>
            </div>
        </main>
    );
}

export default EmployeeEnrollFormComponent;