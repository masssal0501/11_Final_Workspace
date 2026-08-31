import { useEffect, useMemo, useState } from "react";
import "../styles/EmployeeList.css";

import { useNavigate } from "react-router-dom";
import { getEmployeeList } from "../api/employeeApi";

function EmployeeList() {

    const navigate = useNavigate();

    // 직원 목록
    const [employees, setEmployees] = useState([]);

    // 로딩
    const [loading, setLoading] = useState(true);

    // 검색어
    const [searchKeyword, setSearchKeyword] = useState("");

    // 검색 대상
    const [searchType, setSearchType] = useState("all");

    // 부서 필터
    const [depFilter, setDepFilter] = useState("");

    // 상태 필터
    const [statusFilter, setStatusFilter] = useState("");

    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);

    // 페이지당 직원 수
    const itemsPerPage = 5;


    /*
     * 부서명
     */
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


    /*
     * 직위
     */
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
     * 검색 + 필터링
     */
    const filteredEmployees = useMemo(() => {

        return employees.filter((employee) => {

            /*
             * 검색
             */
            const keyword =
                searchKeyword.trim().toLowerCase();

            let matchesSearch = true;

            if (keyword) {

                const empName =
                    employee.empName?.toLowerCase() || "";

                const empId =
                    employee.empId?.toLowerCase() || "";

                const depName =
                    getDepName(employee.depId)
                        .toLowerCase();

                if (searchType === "name") {

                    matchesSearch =
                        empName.includes(keyword);

                } else if (searchType === "id") {

                    matchesSearch =
                        empId.includes(keyword);

                } else {

                    matchesSearch =
                        empName.includes(keyword) ||
                        empId.includes(keyword) ||
                        depName.includes(keyword);

                }

            }


            /*
             * 부서 필터
             */
            const matchesDepartment =
                depFilter === "" ||
                employee.depId === depFilter;


            /*
             * 상태 필터
             */
            const matchesStatus =
                statusFilter === "" ||
                employee.status === statusFilter;


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );

        });

    }, [
        employees,
        searchKeyword,
        searchType,
        depFilter,
        statusFilter
    ]);


    /*
     * 전체 페이지 수
     */
    const totalPages =
        Math.ceil(
            filteredEmployees.length /
            itemsPerPage
        );


    /*
     * 현재 페이지 데이터
     */
    const currentEmployees =
        filteredEmployees.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );


    /*
     * 검색 / 필터 변경
     * → 1페이지로 이동
     */
    const handleSearchChange = (e) => {

        setSearchKeyword(e.target.value);
        setCurrentPage(1);

    };


    const handleSearchTypeChange = (e) => {

        setSearchType(e.target.value);
        setCurrentPage(1);

    };


    const handleDepFilterChange = (e) => {

        setDepFilter(e.target.value);
        setCurrentPage(1);

    };


    const handleStatusFilterChange = (e) => {

        setStatusFilter(e.target.value);
        setCurrentPage(1);

    };


    /*
     * 직원 등록
     */
    const handleAddEmployee = () => {

        navigate("/employee/enrollForm");

    };


    /*
     * 직원 상세
     */
    const handleEmployeeClick = (empNo) => {

        navigate(
            `/employee/detail/${empNo}`
        );

    };


    /*
     * 페이지 이동
     */
    const handlePageChange = (page) => {

        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);

    };


    /*
     * 로딩
     */
    if (loading) {

        return (

            <div className="employeeListPage">

                <div className="employeeListHeader">

                    <h2>
                        직원 관리
                    </h2>

                </div>

                <div>
                    직원 목록을 불러오는 중입니다...
                </div>

            </div>

        );

    }


    return (

        <div className="employeeListPage">

            {/* =========================
                페이지 상단
            ========================= */}
            <div className="employeeListHeader">

                <h2>
                    직원 관리
                </h2>

                <button
                    className="addEmployeeBtn"
                    onClick={handleAddEmployee}
                    title="직원 등록"
                >
                    +
                </button>

            </div>


            {/* =========================
                검색 / 필터
            ========================= */}
            <div className="employeeSearchArea">

                {/* 검색 대상 */}
                <select
                    value={searchType}
                    onChange={handleSearchTypeChange}
                >
                    <option value="all">
                        전체
                    </option>

                    <option value="name">
                        이름
                    </option>

                    <option value="id">
                        아이디
                    </option>
                </select>


                {/* 검색어 */}
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                />


                {/* 부서 */}
                <select
                    value={depFilter}
                    onChange={handleDepFilterChange}
                >
                    <option value="">
                        전체 부서
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


                {/* 상태 */}
                <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                >

                    <option value="">
                        전체 상태
                    </option>

                    <option value="Y">
                        활성
                    </option>

                    <option value="N">
                        비활성
                    </option>

                </select>

            </div>


            {/* =========================
                검색 결과 수
            ========================= */}
            <div className="employeeResultCount">

                총 {filteredEmployees.length}명

            </div>


            {/* =========================
                직원 목록
            ========================= */}
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

                        {currentEmployees.length > 0 ? (

                            currentEmployees.map(
                                (employee) => (

                                    <tr
                                        key={employee.empNo}
                                        onClick={() =>
                                            handleEmployeeClick(
                                                employee.empNo
                                            )
                                        }
                                    >

                                        <td>
                                            {getDepName(
                                                employee.depId
                                            )}
                                        </td>

                                        <td>
                                            {employee.empName}
                                        </td>

                                        <td>
                                            {getJobName(
                                                employee.jobCode
                                            )}
                                        </td>

                                        <td>
                                            {employee.empId}
                                        </td>

                                        <td>
                                            {employee.status === "Y"
                                                ? "활성"
                                                : "비활성"}
                                        </td>

                                    </tr>

                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="emptyEmployee"
                                >
                                    검색 결과가 없습니다.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>


            {/* =========================
                페이지네이션
            ========================= */}
            {totalPages > 0 && (

                <div className="pagination">

                    {/* 이전 */}
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                            handlePageChange(
                                currentPage - 1
                            )
                        }
                    >
                        이전
                    </button>


                    {/* 페이지 번호 */}
                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    ).map((page) => (

                        <button
                            type="button"
                            key={page}
                            className={
                                currentPage === page
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                handlePageChange(page)
                            }
                        >
                            {page}
                        </button>

                    ))}


                    {/* 다음 */}
                    <button
                        type="button"
                        disabled={
                            currentPage === totalPages
                        }
                        onClick={() =>
                            handlePageChange(
                                currentPage + 1
                            )
                        }
                    >
                        다음
                    </button>

                </div>

            )}

        </div>

    );

}

export default EmployeeList;