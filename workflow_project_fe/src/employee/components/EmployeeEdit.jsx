import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../api/employeeApi";

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
    });

    /*
     * 직원 정보 조회
     */
    const loadEmployee = async (empNo) => {

        try {

            const data =
                await getEmployee(empNo);

            console.log(
                "직원 정보:",
                data
            );

            /*
             * 전화번호 분리
             *
             * 010-1234-5678
             * →
             * 010 / 1234 / 5678
             */
            const phone =
                data.phone || "";

            const phoneParts =
                phone.split("-");


            setForm({

                empNo: data.empNo || "",

                empId:
                    data.empId || "",

                empName:
                    data.empName || "",

                phone1:
                    phoneParts[0] || "",

                phone2:
                    phoneParts[1] || "",

                phone3:
                    phoneParts[2] || "",

                email:
                    data.email || "",

                address:
                    data.address || "",

                depId:
                    data.depId || "",

                authCode:
                    data.authCode || "",

                jobCode:
                    data.jobCode || "",

                joinAt:
                    data.joinAt || "",

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

    /*
     * 입력값 변경
     */
    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm({
            ...form,
            [name]: value,
        });

    };

    /*
     * 전화번호 숫자만 입력
     */
    const handlePhoneChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm({
            ...form,
            [name]:
                value.replace(/[^0-9]/g, ""),
        });

    };


    /*
     * 정보 수정
     */
    const handleSubmit = async (e) => {

        e.preventDefault();


        const phone =
            `${form.phone1}-${form.phone2}-${form.phone3}`;


        const updateData = {

            empName:
                form.empName,

            phone:
                phone,

            email:
                form.email,

            address:
                form.address,

            depId:
                form.depId,

            authCode:
                form.authCode,

            jobCode:
                form.jobCode,

        };


        try {

            const result =
                await updateEmployee(
                    form.empNo,
                    updateData
                );

            console.log(
                "정보 수정 성공:",
                result
            );


            /*
             * localStorage의 user 정보도
             * 수정된 내용으로 갱신
             */
            const savedUser =
                localStorage.getItem("user");

            if (savedUser) {

                const loginUser =
                    JSON.parse(savedUser);

                const updatedUser = {

                    ...loginUser,

                    empName:
                        form.empName,

                    phone:
                        phone,

                    email:
                        form.email,

                    address:
                        form.address,

                    depId:
                        form.depId,

                    authCode:
                        form.authCode,

                    jobCode:
                        form.jobCode,

                };

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

            }


            alert(
                "회원정보가 정상적으로 수정되었습니다."
            );

            navigate("/myPage");

        } catch (error) {

            console.error(
                "회원정보 수정 실패:",
                error
            );

            alert(
                error.response?.data?.message ||
                "회원정보 수정에 실패했습니다."
            );

        }

    };    

    return(
        <div className="enrollForm">
            <h2>직원 정보 수정</h2>

            <form>

                <table>
                    <tbody>
                        <tr>
                            <th>아이디</th>
                            <td>
                                <div className="idInputGroup">
                                    <input type="text" name="empId" disabled/>
                                </div>
                            </td>
                            <th>입사일</th>
                            <td></td>
                        </tr>
                        <tr>
                            <th>이름</th>
                            <td><input type="text" name="empName"/></td>
                            <th>직책</th>
                            <td>
                                <select name="authCode" >
                                    <option value="" disabled hidden selected>선택</option>
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
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone2"
                                    maxLength={4}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone3"
                                    maxLength={4}
                                />
                            </td>
                            <th>부서</th>
                            <td>
                                <select name="depId">
                                    <option value="" disabled hidden selected>선택</option>
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
                                <input type="email" name="email"/>
                            </td>
                            <th>직위</th>
                            <td>
                                <select name="jobCode" id="jobCode">
                                    <option value="" disabled hidden selected>선택</option>
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
                                <input type="text" name="address" />
                            </td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td colSpan={3}>
                                <input type="radio" id="active" name="status" value="apple"/>
                                <label htmlFor="active">활성</label>

                                <input type="radio" id="inactive" name="status" value="banana"/>
                                <label htmlFor="inactive">비활성</label>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button"
                onClick={() => navigate(-1)}>
                    돌아가기
                </button>
                <button type="submit">
                    확인
                </button>

            </form>

            
        </div>   
    )
}

export default EmployeeEdit;