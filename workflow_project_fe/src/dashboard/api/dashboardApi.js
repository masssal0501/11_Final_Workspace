import axiosInstance from "../../common/api/axiosInstance"

const BASE_URL = 'http://localhost:8006/workflow/dashboard';

/**
 * [관리자] 전사 대시보드 데이터를 조회하는 API 호출
 * 
 * @returns {Promise} 관리자 대시보드 응답 데이터(AdminDto)를 포함한 Axios Promise 객체
 */
const selectAdminDashboardApi = () => {

    const response = axiosInstance({
        url : `${ BASE_URL }/admin`,
        method : "get"
    });

    return response;
};

/**
 * [부서장] 특정 부서의 대시보드 데이터를 조회하는 API 호출
 * 
 * @param {string} depId 조회할 부서의 부서 아이디
 * @returns {Promise} 부서장 대시보드 응답 데이터(ManagerDto)를 포함한 Axios Promise 객체
 */
const selectManagerDashboardApi = depId => {

    const response = axiosInstance({
        url : `${ BASE_URL }/manager/${depId}`,
        method : "get"
    });

    return response;
};

/**
 * [부서장] 검색 조건(검색어, 기간 등)을 포함한 부서 워케이션 목록 조회 API 호출
 * 
 * @param {string} depId 부서 아이디
 * @param {Object} inputData 검색 조건 객체 (keyword, startDate, endDate 등)
 * @returns {Promise} 조건에 부합하는 워케이션 목록 데이터(List<WorkcationListDto>)를 포함한 Axios Promise 객체
 */
const selectManagerWorkcationListApi = (depId, inputData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/manager/${depId}/workcation`,
        method : "get",
        params : inputData
    });

    return response;
};

/**
 * [사원] 특정 사원의 개인 대시보드 데이터를 조회하는 API 호출
 * 
 * @param {number} empNo 조회할 사원의 사원 번호(사번)
 * @returns {Promise} 사원 대시보드 응답 데이터(StaffDto)를 포함한 Axios Promise 객체
 */
const selectStaffDashboardApi = empNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/staff/${empNo}`,
        method : "get"
    });

    return response;
}

/**
 * [사원] 검색 조건(검색어, 기간 등)을 포함한 개인 예약 리스트 조회 API 호출
 * 
 * @param {number} empNo 사원 번호(사번)
 * @param {Object} inputData 검색 조건 객체 (keyword, startDate, endDate 등)
 * @returns {Promise} 조건에 부합하는 예약 목록 데이터(List<Reservation>)를 포함한 Axios Promise 객체
 */
const selectStaffReservationListApi = (empNo, inputData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/staff/${empNo}/reservation`,
        method : "get",
        params : inputData
    });

    return response;
}

const selectStaffHubApi = empNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/staff/${empNo}/commute`,
        method : "get"
    });

    return response;

}

export { selectAdminDashboardApi, selectManagerDashboardApi, selectManagerWorkcationListApi, selectStaffDashboardApi, selectStaffReservationListApi, selectStaffHubApi };