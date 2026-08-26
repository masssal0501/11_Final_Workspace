import axiosInstance from "../../common/api/axiosInstance";

/*
 * USR-001
 * 계정 등록
 */
export const createEmployee = async (employeeData) => {

    const response = await axiosInstance.post(
        "/employees",
        employeeData
    );

    return response.data;
};

/*
 * 아이디 중복 확인
 */
export const checkEmpIdDuplicate = async (empId) => {

    const response = await axiosInstance.get(
        "/employees/checkId",
        {
            params: {
                empId,
            },
        }
    );

    return response.data;
}

/*
 * USR-002
 * 사용자 로그인
 */
export const login = async (loginData) => {

    const response = await axiosInstance.post(
        "/employees/login",
        loginData
    );

    return response.data;
};

/*
 * USR-003
 * 사용자 로그아웃
 */
export const logout = async () => {

    const token =
        localStorage.getItem("accessToken");

    const response = await axiosInstance.post(
        "/employees/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

/*
 * USR-004
 * 비밀번호 재설정
 */
export const changePassword = async (data) => {

    const token =
        localStorage.getItem("accessToken");

    const response = await axiosInstance.put(
        "/employees/password",
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

/*
 * USR-005
 * 마이페이지 / 사용자 상세 조회
 */
export const getEmployee = async (empNo) => {

    const response = await axiosInstance.get(
        `/employees/${empNo}`
    );

    return response.data;
};


/*
 * USR-006
 * 사용자 정보 수정
 */
export const updateEmployee = async (
    empNo,
    employeeData
) => {

    const response = await axiosInstance.put(
        `/employees/${empNo}`,
        employeeData
    );

    return response.data;
};


/*
 * USR-007
 * 계정 상태 변경
 */
export const updateEmployeeStatus = async (
    empNo,
    status
) => {

    const response = await axiosInstance.patch(
        `/employees/${empNo}/status`,
        null,
        {
            params: {
                status,
            },
        }
    );

    return response.data;
};


/*
 * USR-008
 * 계정 목록 조회
 */
export const getEmployeeList = async () => {

    const token =
        localStorage.getItem("accessToken");

    const response = await axiosInstance.get(
        "/employees",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


/*
 * USR-011
 * 사원 역할 변경
 */
export const updateEmployeeRole = async (
    empNo,
    authCode
) => {

    const response = await axiosInstance.patch(
        `/employees/${empNo}/role`,
        null,
        {
            params: {
                authCode,
            },
        }
    );

    return response.data;
};