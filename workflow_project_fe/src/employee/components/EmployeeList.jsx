import { useEffect, useState } from "react";
import "../styles/EmployeeList.css";

import { useNavigate } from "react-router-dom";
import { getEmployeeList } from "../api/employeeApi";

function EmployeeList() {

    const navigate = useNavigate();

    // 직원 목록
    const [employees, setEmployees] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);


    // 부서
    const getDepName = (depId) => {

        switch (depId) {

            case "D1":
                return "기획";

            case "D2":
                return "디자인";

            case "D3":
                return "FE 개발";
            
            case "D4":
                return "BE 개발";
            
            case "D5":
                return "데이터";

            case "D6":
                return "QA";

            default:
                return "";
        }
    };


    // 직위
    const getJobName = (jobCode) => {

        switch (jobCode) {

            case "J1":
                return "사원";

            case "J2":
                return "대리";

            case "J3":
                return "과장";

            case "J4":
                return "차장";

            case "J5":
                return "부장";

            default:
                return "";
        }
    };

    /*
     * 직원 목록 조회
     */
    useEffect(() => {

        const loadEmployees = async () => {

            try {

                const data =
                    await getEmployeeList();

                console.log(
                    "직원 목록:",
                    data
                );

                setEmployees(data);

            } catch (error) {

                console.error(
                    "직원 목록 조회 실패:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "직원 목록을 불러오지 못했습니다."
                );

            } finally {

                setLoading(false);

            }
        };

        loadEmployees();

    }, []);


    /*
     * 직원 등록 페이지 이동
     */
    const handleAddEmployee = () => {

        navigate("/employee/enrollForm");

    };


    /*
     * 직원 상세 페이지 이동
     */
    const handleEmployeeClick = (empNo) => {

        console.log(
            "직원 상세:",
            empNo
        );

        navigate(`/employee/detail/${empNo}`);

    };


    return (

        <main className="wf-container">

            {/* 페이지 상단 */}
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">직원 관리</h1>
                    <p className="wf-page-description">전체 직원 목록을 조회하고 신규 직원을 등록합니다.</p>
                </div>

                <div className="wf-page-actions">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddEmployee}
                    >
                        + 직원 등록
                    </button>
                </div>
            </section>

            <div className="wf-page-content">
                {/* 직원 목록 */}
                <div className="employeeTableWrapper">

                    <table className="employeeTable">

                        <thead>

                            <tr>

                                <th>
                                    부서명
                                </th>

                                <th>
                                    사원명
                                </th>

                                <th>
                                    직위
                                </th>

                                <th>
                                    아이디
                                </th>

                                <th>
                                    상태
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr className="wf-empty-row">
                                    <td colSpan={5}>
                                        직원 목록을 불러오는 중입니다.
                                    </td>
                                </tr>

                            ) : employees.length > 0 ? (

                                employees.map((employee) => (

                                    <tr
                                        key={employee.empNo}
                                        onClick={() =>
                                            handleEmployeeClick(
                                                employee.empNo
                                            )
                                        }
                                    >

                                        <td>
                                            {getDepName(employee.depId)}
                                        </td>

                                        <td>
                                            {employee.empName}
                                        </td>

                                        <td>
                                            {getJobName(employee.jobCode)}
                                        </td>

                                        <td>
                                            {employee.empId}
                                        </td>

                                        <td>
                                            {employee.status === "Y"
                                                ? <span className="badge bg-success">활성</span>
                                                : <span className="badge bg-secondary">비활성</span>}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr className="wf-empty-row">

                                    <td colSpan={5}>
                                        등록된 직원이 없습니다.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>
            </div>

        </main>

    );

}

export default EmployeeList;