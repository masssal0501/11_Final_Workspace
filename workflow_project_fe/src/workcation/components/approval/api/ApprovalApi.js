import axiosInstance from "../../common/api/axiosInstance";

const BASE_URL = "/approval";

export const ApprovalApi = {

    getApprovalList: async () => {

        const response = await axiosInstance.get(BASE_URL);

        return response.data;
    },

    getApprovalDetail: async (workcationNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/${workcationNo}`
        );

        return response.data;
    }
};