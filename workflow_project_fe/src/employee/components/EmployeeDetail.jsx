import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../api/employeeApi";

function EmployeeDetail() {

    const { empNo } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    console.log("수정할 직원 번호:", empNo);

    useEffect(() => {

        loadEmployee();

    }, [empNo]);

    // 직책
    const getAuthName = (authCode) => {

        switch (authCode) {

            case "ADMIN":
                return "관리자";

            case "MANAGER":
                return "부서장";

            case "STAFF":
                return "평사원";

            default:
                return "";
        }
    };

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

    // 계정 상태
    const getStatusName = (status) => {

        switch (status) {

            case "Y":
                return "활성";

            case "N":
                return "비활성";

            default:
                return "";
        }
    };

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
        return <div>직원 정보를 불러오는 중...</div>;
    }


    return(
        <div className="enrollForm">
            <h2>직원 정보</h2>

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
                                {getStatusName(employee.status)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button"
                onClick={() => navigate(-1)}>
                    돌아가기
                </button>
                <button type="button"
                onClick={() => navigate(`/employee/edit/${empNo}`)}>
                    편집
                </button>

            </form>

            
        </div>   
    )
}

export default EmployeeDetail;