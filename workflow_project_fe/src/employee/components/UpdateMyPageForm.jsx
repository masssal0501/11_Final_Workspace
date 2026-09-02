import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEmployee, updateEmployee } from "../api/employeeApi";

function UpdateMyPageForm() {

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

    const [loading, setLoading] = useState(true);


    /*
     * 현재 로그인한 사용자 정보 가져오기
     */
    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const loginUser =
            JSON.parse(savedUser);

        const empNo =
            loginUser.empNo;

        if (!empNo) {
            alert("사용자 정보를 확인할 수 없습니다.");
            navigate("/login");
            return;
        }

        loadEmployee(empNo);

    }, [navigate]);


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


    /*
     * 로딩
     */
    if (loading) {

        return (
            <div className="enrollForm">
                <h2>마이 페이지 수정</h2>
                <p>사용자 정보를 불러오는 중입니다...</p>
            </div>
        );

    }


    return (

        <div className="enrollForm">

            <h2>
                마이 페이지 수정
            </h2>


            <form onSubmit={handleSubmit}>

                <table>

                    <tbody>

                        {/* 아이디 / 입사일 */}
                        <tr>

                            <th>
                                아이디
                            </th>

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


                            <th>
                                입사일
                            </th>

                            <td>
                                {form.joinAt || "-"}
                            </td>

                        </tr>


                        {/* 이름 / 직책 */}
                        <tr>

                            <th>
                                이름
                            </th>

                            <td>

                                <input
                                    type="text"
                                    name="empName"
                                    value={form.empName}
                                    onChange={handleChange}
                                />

                            </td>


                            <th>
                                직책
                            </th>

                            <td>
                                {getAuthName(form.authCode)}
                            </td>

                        </tr>


                        {/* 연락처 / 부서 */}
                        <tr>

                            <th>
                                연락처
                            </th>

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


                            <th>
                                부서
                            </th>

                            <td>
                                {getDepName(form.depId) || ""}
                            </td>

                        </tr>


                        {/* 이메일 / 직위 */}
                        <tr>

                            <th>
                                이메일
                            </th>

                            <td>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </td>


                            <th>
                                직위
                            </th>

                            <td>
                                {getJobName(form.jobCode)}
                            </td>

                        </tr>


                        {/* 주소 */}
                        <tr>

                            <th>
                                주소
                            </th>

                            <td colSpan={3}>

                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </td>

                        </tr>

                    </tbody>

                </table>


                {/* 버튼 */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    돌아가기
                </button>


                <button
                    type="button"
                >
                    <Link to="/changePW">
                        비밀번호 변경
                    </Link>
                </button>


                <button
                    type="submit"
                    className="btnPrimary"
                >
                    확인
                </button>

            </form>

        </div>

    );

}

export default UpdateMyPageForm;