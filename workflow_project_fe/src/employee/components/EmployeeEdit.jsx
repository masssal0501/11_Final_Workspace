import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EmployeeEnrollFormComponent.css";
import {
    getEmployee,
    updateEmployee,
    updateEmployeeRole,
    updateEmployeeStatus,
} from "../api/employeeApi";

function EmployeeEdit() {

    const { empNo } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    const [empName, setEmpName] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [phone1, setPhone1] = useState("");
    const [phone2, setPhone2] = useState("");
    const [phone3, setPhone3] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");

    console.log("수정할 직원 번호:", empNo);

    useEffect(() => {

        loadEmployee();

    }, [empNo]);


    const loadEmployee = async () => {

        try {

            const data =
                await getEmployee(empNo);

            console.log("직원 정보:", data);

            setEmployee(data);

            setEmpName(data.empName || "");
            setAuthCode(data.authCode || "");
            setEmail(data.email || "");
            setAddress(data.address || "");
            setStatus(data.status || "");

            const [p1 = "", p2 = "", p3 = ""] =
                (data.phone || "").split("-");

            setPhone1(p1);
            setPhone2(p2);
            setPhone3(p3);

        } catch (error) {

            console.error(
                "직원 정보 조회 실패:",
                error
            );

            alert("직원 정보를 불러오지 못했습니다.");
        }
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateEmployee(empNo, {
                empName,
                phone: [phone1, phone2, phone3].join("-"),
                email,
                address,
            });

            // depId/jobCode는 이 화면에서 수정할 수 없지만(백엔드 미지원),
            // 역할 변경 API가 세 필드를 통째로 덮어쓰므로 기존 값을 함께 보내야 한다.
            await updateEmployeeRole(empNo, {
                authCode,
                depId: employee.depId,
                jobCode: employee.jobCode,
            });
            await updateEmployeeStatus(empNo, status);

            alert("직원 정보를 수정했습니다.");

            navigate(`/employee/detail/${empNo}`);

        } catch (error) {

            console.error(
                "직원 정보 수정 실패:",
                error
            );

            alert("직원 정보 수정에 실패했습니다.");
        }
    };


    if (!employee) {
        return (
            <main className="wf-container">
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <span className="wf-state-title">직원 정보를 불러오는 중입니다.</span>
                </div>
            </main>
        );
    }


    return(
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">직원 정보 수정</h1>
                    <p className="wf-page-description">{employee.empName}님의 인사 정보를 수정합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="enrollForm">
            <form onSubmit={handleSubmit}>

                <table>
                    <tbody>
                        <tr>
                            <th>아이디</th>
                            <td>
                                <div className="idInputGroup">
                                    <input type="text" name="empId" defaultValue={employee.empId} disabled/>
                                </div>
                            </td>
                            <th>입사일</th>
                            <td>{employee.joinAt}</td>
                        </tr>
                        <tr>
                            <th>이름</th>
                            <td>
                                <input
                                    type="text"
                                    name="empName"
                                    value={empName}
                                    onChange={(e) => setEmpName(e.target.value)}
                                />
                            </td>
                            <th>직책</th>
                            <td>
                                <select
                                    name="authCode"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                >
                                    <option value="" disabled hidden>선택</option>
                                    <option value="STAFF">평사원</option>
                                    <option value="MANAGER">부서장</option>
                                    <option value="ADMIN">관리자</option>
                                </select>
                            </td>

                        </tr>
                        <tr>
                            <th>연락처</th>
                            <td>
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone1"
                                    maxLength={3}
                                    value={phone1}
                                    onChange={(e) => setPhone1(e.target.value)}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone2"
                                    maxLength={4}
                                    value={phone2}
                                    onChange={(e) => setPhone2(e.target.value)}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone3"
                                    maxLength={4}
                                    value={phone3}
                                    onChange={(e) => setPhone3(e.target.value)}
                                />
                            </td>
                            <th>부서</th>
                            <td>
                                {/* 부서 변경 API가 백엔드에 없어 저장되지 않으므로 조회만 가능하도록 비활성화 */}
                                <select name="depId" defaultValue={employee.depId} disabled>
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
                            <th>이메일</th>
                            <td>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </td>
                            <th>직위</th>
                            <td>
                                {/* 직위 변경 API가 백엔드에 없어 저장되지 않으므로 조회만 가능하도록 비활성화 */}
                                <select name="jobCode" id="jobCode" defaultValue={employee.jobCode} disabled>
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
                            <th>주소</th>
                            <td colSpan={3}>
                                <input
                                    type="text"
                                    name="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td colSpan={3}>
                                <input
                                    type="radio"
                                    id="active"
                                    name="status"
                                    value="Y"
                                    checked={status === "Y"}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                <label htmlFor="active">재직</label>

                                <input
                                    type="radio"
                                    id="inactive"
                                    name="status"
                                    value="N"
                                    checked={status === "N"}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                <label htmlFor="inactive">퇴사</label>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button" className="btn btn-secondary"
                onClick={() => navigate(-1)}>
                    돌아가기
                </button>
                <button type="submit" className="btnPrimary">
                    저장
                </button>

            </form>
            </div>
            </div>
        </main>
    )
}

export default EmployeeEdit;
