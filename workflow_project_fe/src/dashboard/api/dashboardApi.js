import axiosInstance from "../../common/api/axiosInstance"

const BASE_URL = 'http://localhost:8006/workflow/dashboard';

const selectAdminDashboardApi = () => {

    const response = axiosInstance({
        url : `${ BASE_URL }/admin`,
        method : "get"
    });

    return response;
};

export { selectAdminDashboardApi };