import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../api/employeeApi";
import "../styles/EmployeeEnrollFormComponent.css";

function EmployeeDetail() {

    const { empNo } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    console.log("수정할 직원 번호:", empNo);

    // 코드값을 화면에 표시할 명칭으로 변환(표시 전용, 데이터/저장 로직에는 영향 없음)
    const getDepName = (depId) => {
        switch (depId) {
            case "D1": return "기획";
            case "D2": return "디자인";
            case "D3": return "FE 개발";
            case "D4": return "BE 개발";
            case "D5": return "데이터";
            case "D6": return "QA";
            default: return depId || "-";
        }
    };

    const getJobName = (jobCode) => {
        switch (jobCode) {
            case "J1": return "사원";
            case "J2": return "대리";
            case "J3": return "과장";
            case "J4": return "차장";
            case "J5": return "부장";
            default: return jobCode || "-";
        }
    };

    const getAuthName = (authCode) => {
        switch (authCode) {
            case "ADMIN": return "관리자";
            case "MANAGER": return "부서장";
            case "STAFF": return "사원";
            default: return authCode || "-";
        }
    };

    useEffect(() => {

        loadEmployee();

    }, [empNo]);


    const loadEmployee = async () => {

        try {

            const data =
                await getEmployee(empNo);

            console.log("직원 정보:", data);

            setEmployee(data);

        } catch (error) {

            console.error(
                "직원 정보 조회 실패:",
                error
            );

            alert("직원 정보를 불러오지 못했습니다.");
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
                    <h1 className="wf-page-title">직원 상세</h1>
                    <p className="wf-page-description">{employee.empName}님의 인사 정보를 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
                <div className="enrollForm">
                    <form>

                        <table>
                            <tbody>
                                <tr>
                                    <th>아이디</th>
                                    <td>
                                        <div className="idInputGroup">
                                            {employee.empId}
                                        </div>
                                    </td>
                                    <th>입사일</th>
                                    <td>
                                        {employee.joinAt}
                                    </td>
                                </tr>
                                <tr>
                                    <th>이름</th>
                                    <td>
                                        {employee.empName}
                                    </td>
                                    <th>직책</th>
                                    <td>
                                        {getAuthName(employee.authCode)}
                                    </td>

                                </tr>
                                <tr>
                                    <th>연락처</th>
                                    <td>
                                        {employee.phone}
                                    </td>
                                    <th>부서</th>
                                    <td>
                                        {getDepName(employee.depId)}
                                    </td>

                                </tr>
                                <tr>
                                    <th>이메일</th>
                                    <td>
                                        {employee.email}
                                    </td>
                                    <th>직위</th>
                                    <td>
                                        {getJobName(employee.jobCode)}
                                    </td>
                                </tr>
                                <tr>
                                    <th>주소</th>
                                    <td colSpan={3}>
                                        {employee.address}
                                    </td>
                                </tr>
                                <tr>
                                    <th>상태</th>
                                    <td>
                                        {employee.status === "Y"
                                            ? <span className="badge bg-success">활성</span>
                                            : <span className="badge bg-secondary">비활성</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {/* BUG-002: navigate(-1) 대신 직원 목록으로 고정 이동(직접 URL 접근 대응) */}
                        <button type="button" className="btn btn-secondary"
                        onClick={() => navigate("/employee/list")}>
                            돌아가기
                        </button>
                        <button type="button" className="btnPrimary"
                        onClick={() => navigate(`/employee/edit/${empNo}`)}>
                            편집
                        </button>

                    </form>
                </div>
            </div>
        </main>
    )
}

export default EmployeeDetail;