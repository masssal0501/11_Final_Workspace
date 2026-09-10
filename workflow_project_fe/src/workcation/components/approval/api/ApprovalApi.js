import axiosInstance from "../../../../common/api/axiosInstance";

const BASE_URL = "/approval";

export const ApprovalApi = {

    // 승인 이력 목록 조회
    getApprovalList: async (
        cpage = 1,
        startDate = "",
        endDate = "",
        searchType = "workcationTitle",
        keyword = ""
    ) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/list`,
            {
                params: {
                    cpage,
                    startDate,
                    endDate,
                    searchType,
                    keyword
                }
            }
        );

        return response.data;
    },


    // 승인 대기 목록 조회
    getApprovalQueueList: async (
        cpage = 1,
        startDate = "",
        endDate = "",
        searchType = "workcationTitle",
        keyword = "",
        status = ""
    ) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/queue`,
            {
                params: {
                    cpage,
                    startDate,
                    endDate,
                    searchType,
                    keyword,
                    status
                }
            }
        );

        return response.data;
    },


    // 승인 이력 상세 조회
    getApprovalDetail: async (workcationNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/queue/${workcationNo}`
        );

        console.log("ApprovalApi response :", response);
        console.log("ApprovalApi response.data :", response.data);

        return response.data;
    },


        // 승인 / 반려 처리
        rejectApproval: async (
            workcationNo,
            workcation
        ) => {

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
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("승인 / 반려 처리 응답 :", response);
            console.log("승인 / 반려 처리 결과 :", response.data);

            return response.data;
        }
};