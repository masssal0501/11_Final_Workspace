import axiosInstance from "../../../../common/api/axiosInstance";

const BASE_URL = "/approval";

export const ApprovalApi = {

    // 승인 이력 목록 조회
    getApprovalList: async (cpage = 1) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/list`,
            {
                params: {
                    cpage
                }
            }
        );

        return response.data;
    },


    // 승인 이력 상세 조회
    getApprovalDetail: async (workcationNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/${workcationNo}`
        );

        return response.data;
    },


    // 승인 / 반려 상태 등록
    rejectApproval: async (workcationNo, workcation) => {

        const formData = new FormData();

        formData.append(
            "workcation",
            new Blob(
                [JSON.stringify(workcation)],
                {
                    type: "application/json"
                }
            )
        );

        const response = await axiosInstance.post(
            `${BASE_URL}/${workcationNo}`,
            formData
        );

        return response.data;
    }

};