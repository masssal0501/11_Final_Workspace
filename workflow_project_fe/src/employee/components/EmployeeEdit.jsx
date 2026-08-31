import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getEmployee,
    updateEmployee,
    updateEmployeeStatus,
    updateEmployeeRole
} from "../api/employeeApi";

function EmployeeEdit() {

    const { empNo } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        empNo: "",
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
        
        joinAt: "",
        status: "",
    });

    const [loading, setLoading] = useState(true);


    /*
     * 직원 정보 조회
     */
    useEffect(() => {

        const loadEmployee = async () => {

            try {

                const data = await getEmployee(empNo);

                console.log("직원 정보:", data);
                console.log("status:", data.status);

                // 전화번호 분리
                const phone = data.phone || "";
                const phoneParts = phone.split("-");

                setForm({
                    empNo: data.empNo || "",
                    empId: data.empId || "",
                    empName: data.empName || "",

                    phone1: phoneParts[0] || "",
                    phone2: phoneParts[1] || "",
                    phone3: phoneParts[2] || "",

                    email: data.email || "",
                    address: data.address || "",

                    depId: data.depId || "",
                    authCode: data.authCode || "",
                    jobCode: data.jobCode || "",

                    joinAt: data.joinAt || "",
                    status: String(data.status || "").toUpperCase(),
                });

            } catch (error) {

                console.error(
                    "직원 정보 조회 실패:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "직원 정보를 불러오지 못했습니다."
                );

                navigate(-1);

            } finally {

                setLoading(false);

            }
        };

        loadEmployee();

    }, [empNo, navigate]);


    /*
     * 일반 입력값 변경
     */
    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    /*
     * 전화번호 변경
     */
    const handlePhoneChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value.replace(/[^0-9]/g, "")
        }));

    };


    /*
     * 정보 수정
     */
    const handleSubmit = async (e) => {

        e.preventDefault();

        const phone =
            `${form.phone1}-${form.phone2}-${form.phone3}`;

        try {

            /*
            * 1. 일반 정보 수정
            */
            const updateData = {

                empName: form.empName,
                phone: phone,
                email: form.email,
                address: form.address

            };

            await updateEmployee(
                form.empNo,
                updateData
            );


            /*
            * 2. 계정 상태 변경
            */
            await updateEmployeeStatus(
                form.empNo,
                form.status
            );


            /*
            * 3. 역할 변경
            */
            await updateEmployeeRole(
                form.empNo,
                { 
                    depId: form.depId, 
                    jobCode: form.jobCode, 
                    authCode: form.authCode 
                }
            );


            /*
            * 모든 수정 성공
            */
            alert(
                "직원 정보가 정상적으로 수정되었습니다."
            );

            /*
            * 직원 목록으로 이동
            */
            navigate(`/employee/detail/${empNo}`);


        } catch (error) {

            console.error(
                "직원 정보 수정 실패:",
                error
            );

            console.error(
                "status:",
                error.response?.status
            );

            console.error(
                "data:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "직원 정보 수정에 실패했습니다."
            );
        }
    };


    /*
     * 로딩
     */
    if (loading) {

        return (
            <div className="enrollForm">
                <h2>직원 정보 수정</h2>
                <p>직원 정보를 불러오는 중입니다...</p>
            </div>
        );

    }


    return (

        <div className="enrollForm">

            <h2>직원 정보 수정</h2>

            <form onSubmit={handleSubmit}>

                <table>

                    <tbody>

                        {/* 아이디 / 입사일 */}
                        <tr>

                            <th>아이디</th>

                            <td>

                                <div className="idInputGroup">

                                    <input
                                        type="text"
                                        name="empId"
                                        value={form.empId}
                                        disabled
                                    />

                                </div>

                            </td>

                            <th>입사일</th>

                            <td>
                                {form.joinAt
                                    ? form.joinAt.substring(0, 10)
                                    : ""
                                }
                            </td>

                        </tr>


                        {/* 이름 / 직책 */}
                        <tr>

                            <th>이름</th>

                            <td>

                                <input
                                    type="text"
                                    name="empName"
                                    value={form.empName}
                                    onChange={handleChange}
                                />

                            </td>

                            <th>직책</th>

                            <td>

                                <select
                                    name="authCode"
                                    value={form.authCode}
                                    onChange={handleChange}
                                >

                                    <option value="" disabled hidden>
                                        선택
                                    </option>

                                    <option value="STAFF">
                                        평사원
                                    </option>

                                    <option value="MANAGER">
                                        부서장
                                    </option>

                                    <option value="ADMIN">
                                        관리자
                                    </option>

                                </select>

                            </td>

                        </tr>


                        {/* 연락처 / 부서 */}
                        <tr>

                            <th>연락처</th>

                            <td>

                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone1"
                                    maxLength={3}
                                    value={form.phone1}
                                    onChange={handlePhoneChange}
                                />

                                &nbsp;-&nbsp;

                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone2"
                                    maxLength={4}
                                    value={form.phone2}
                                    onChange={handlePhoneChange}
                                />

                                &nbsp;-&nbsp;

                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone3"
                                    maxLength={4}
                                    value={form.phone3}
                                    onChange={handlePhoneChange}
                                />

                            </td>

                            <th>부서</th>

                            <td>

                                <select
                                    name="depId"
                                    value={form.depId}
                                    onChange={handleChange}
                                >

                                    <option value="" disabled hidden>
                                        선택
                                    </option>

                                    <option value="D1">
                                        기획
                                    </option>

                                    <option value="D2">
                                        디자인
                                    </option>

                                    <option value="D3">
                                        FE 개발
                                    </option>

                                    <option value="D4">
                                        BE 개발
                                    </option>

                                    <option value="D5">
                                        데이터
                                    </option>

                                    <option value="D6">
                                        QA
                                    </option>

                                </select>

                            </td>

                        </tr>


                        {/* 이메일 / 직위 */}
                        <tr>

                            <th>이메일</th>

                            <td>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </td>

                            <th>직위</th>

                            <td>

                                <select
                                    name="jobCode"
                                    value={form.jobCode}
                                    onChange={handleChange}
                                >

                                    <option value="" disabled hidden>
                                        선택
                                    </option>

                                    <option value="J1">
                                        사원
                                    </option>

                                    <option value="J2">
                                        대리
                                    </option>

                                    <option value="J3">
                                        과장
                                    </option>

                                    <option value="J4">
                                        차장
                                    </option>

                                    <option value="J5">
                                        부장
                                    </option>

                                </select>

                            </td>

                        </tr>


                        {/* 주소 */}
                        <tr>

                            <th>주소</th>

                            <td colSpan={3}>

                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </td>

                        </tr>


                        {/* 상태 */}
                        <tr>

                            <th>상태</th>

                            <td colSpan={3}>

                                <input
                                    type="radio"
                                    id="active"
                                    name="status"
                                    value="Y"
                                    checked={form.status === "Y"}
                                    onChange={handleChange}
                                />

                                <label htmlFor="active">
                                    활성
                                </label>


                                <input
                                    type="radio"
                                    id="inactive"
                                    name="status"
                                    value="N"
                                    checked={form.status === "N"}
                                    onChange={handleChange}
                                />

                                <label htmlFor="inactive">
                                    비활성
                                </label>

                            </td>

                        </tr>

                    </tbody>

                </table>


                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    돌아가기
                </button>


                <button type="submit">
                    확인
                </button>

            </form>

        </div>
    );
}



export default EmployeeEdit;