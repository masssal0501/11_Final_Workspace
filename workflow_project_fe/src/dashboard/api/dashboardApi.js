import axiosInstance from "../../common/api/axiosInstance"

const BASE_URL = 'http://localhost:8006/workflow/dashboard';

const selectAdminDashboardApi = () => {

    const response = axiosInstance({
        url : `${ BASE_URL }/admin`,
        method : "get"
    });

    return response;
};

const selectManagerDashboardApi = depId => {

    const response = axiosInstance({
        url : `${ BASE_URL }/manager/${depId}`,
        method : "get"
    });

    return response;
};

const selectManagerWorkcationListApi = (depId, inputData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/manager/${depId}/workcation`,
        method : "get",
        params : inputData
    });

    return response;
};

const selectStaffDashboardApi = empNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/staff/${empNo}`,
        method : "get"
    });

    return response;
}

const selectStaffReservationListApi = (empNo, inputData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/staff/${empNo}/reservation`,
        method : "get",
        params : inputData
    });

    return response;
}

export { selectAdminDashboardApi, selectManagerDashboardApi, selectManagerWorkcationListApi, selectStaffDashboardApi, selectStaffReservationListApi };