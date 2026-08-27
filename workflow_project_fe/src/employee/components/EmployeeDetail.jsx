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
                                {employee.authCode}
                            </td>
                            
                        </tr>
                        <tr>
                            <th>연락처</th>
                            <td>
                                {employee.phone}
                            </td>
                            <th>부서</th>
                            <td>
                                {employee.depId}
                            </td>
                            
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>
                                {employee.email}
                            </td>
                            <th>직위</th>
                            <td>
                                {employee.jobCode}
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
                                {employee.status}
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