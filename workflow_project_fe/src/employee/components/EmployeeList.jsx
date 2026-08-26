import { useEffect, useState } from "react";
import "../styles/EmployeeList.css";

import { useNavigate } from "react-router-dom";

function EmployeeList() {
    // 임시 직원 데이터
    const [employees, setEmployees] = useState([
        {
            empNo: 1,
            depName: "영업팀",
            empName: "홍길동",
            jobCode : "대리",
            empId: "0000-0001",
            status: "활성"
        },
        {
            empNo: 2,
            depName: "개발팀",
            empName: "고길동",
            jobCode : "부장",
            empId: "0000-0002",
            
        },
        {
            empNo: 3,
            depName: "운영팀",
            empName: "xxx",
            jobCode : "과장",
            empId: "0000-00×1",
            
        },
        {
            empNo: 4,
            depName: "기획팀",
            empName: "xxxx",
            jobCode : "대리",
            empId: "0000-00xx"
        },
        {
            empNo: 5,
            depName: "XX팀",
            empName: "xxxx",
            jobCode : "사원",
            empId: "xxxx-xxxxx"
        },
        {
            empNo: 6,
            depName: "XX팀",
            empName: "xxx",
            jobCode : "사원",
            empId: "xxxx-xxxxx"
        }
    ]);

    // 직원 등록 페이지 이동
    const handleAddEmployee = () => {
        console.log("직원 등록 페이지 이동");
        navigate("/employee/enrollForm");
    };

    // 직원 상세 페이지 이동
    const handleEmployeeClick = (empNo) => {
        console.log("직원 상세:", empNo);
        // navigate(`/employees/${empNo}`);
    };

    return (
        <div className="employeeListPage">

            {/* 페이지 상단 */}
            <div className="employeeListHeader">
                <h2>직원 관리</h2>

                <button
                    className="addEmployeeBtn"
                    onClick={handleAddEmployee}
                    title="직원 등록"
                >
                    +
                </button>
            </div>

            {/* 직원 목록 */}
            <div className="employeeTableWrapper">
                <table className="employeeTable">
                    <thead>
                        <tr>
                            <th>부서명</th>
                            <th>사원명</th>
                            <th>직위</th>
                            <th>사번</th>
                            <th>상태</th>
                        </tr>
                    </thead>

                    <tbody>
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <tr
                                    key={employee.empNo}
                                    onClick={() =>
                                        handleEmployeeClick(employee.empNo)
                                    }
                                >
                                    <td>{employee.depName}</td>
                                    <td>{employee.empName}</td>
                                    <td>{employee.jobCode}</td>
                                    <td>{employee.empId}</td>
                                    <td>{employee.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="emptyEmployee">
                                    등록된 직원이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default EmployeeList;