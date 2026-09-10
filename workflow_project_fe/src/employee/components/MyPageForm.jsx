import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployee } from "../api/employeeApi";

function MyPageForm() {

    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    // 현재 로그인한 사용자 정보
    const loginUser = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        const fetchEmployee = async () => {

            try {

                if (!loginUser?.empNo) {
                    return;
                }

                const data = await getEmployee(
                    loginUser.empNo
                );

                console.log("마이페이지 정보:", data);

                setEmployee(data);

            } catch (error) {

                console.error(
                    "사용자 정보 조회 실패:",
                    error
                );

            }
        };

        fetchEmployee();

    }, [loginUser?.empNo]);


    // 데이터 로딩 전
    if (!employee) {
        return (
            <main className="wf-container">
                <section className="wf-page-header">
                    <div>
                        <h1 className="wf-page-title">마이페이지</h1>
                    </div>
                </section>
                <div className="wf-state">
                    <div className="wf-spinner" />
                    <span className="wf-state-title">사용자 정보를 불러오는 중입니다.</span>
                </div>
            </main>
        );
    }


    // 전화번호 분리
    const phone = employee.phone
        ? employee.phone.split("-")
        : ["", "", ""];


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


    return (

        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">마이페이지</h1>
                    <p className="wf-page-description">나의 인사 정보를 확인합니다.</p>
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
                                {employee.empId || ""}
                            </td>

                            <th>입사일</th>

                            <td>
                                {employee.joinAt
                                    ? employee.joinAt.substring(0, 10)
                                    : ""}
                            </td>

                        </tr>


                        <tr>

                            <th>이름</th>

                            <td>
                                {employee.empName || ""}
                            </td>

                            <th>직책</th>

                            <td>
                                {getAuthName(
                                    employee.authCode
                                )}
                            </td>

                        </tr>


                        <tr>

                            <th>연락처</th>

                            <td>
                                {phone[0]}-{phone[1]}-{phone[2]}
                            </td>

                            <th>부서</th>

                            <td>
                                {getDepName(employee.depId) || ""}
                            </td>

                        </tr>


                        <tr>

                            <th>이메일</th>

                            <td>
                                {employee.email || ""}
                            </td>

                            <th>직위</th>

                            <td>
                                {getJobName(employee.jobCode)}
                            </td>

                        </tr>


                        <tr>

                            <th>주소</th>

                            <td colSpan={3}>
                                {employee.address || ""}
                            </td>

                        </tr>

                    </tbody>

                </table>


                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    돌아가기
                </button>


                <button
                    type="button"
                    className="btnPrimary"
                    onClick={() => navigate("/myPage/update")}
                >
                    정보 수정
                </button>

            </form>
            </div>
            </div>
        </main>
    );
}

export default MyPageForm;