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


    // 승인 이력 상세 조회 (승인 완료(A) 건만 조회 가능 - ApprovalHistoryDetail에서 사용)
    getApprovalDetail: async (workcationNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/${workcationNo}`
        );

        return response.data;
    },

    // 승인 대기 상세 조회 (상태 제한 없음 - ApprovalReject의 승인/반려 처리 화면에서 사용)
    getApprovalQueueDetail: async (workcationNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/queue/${workcationNo}`
        );

        return response.data;
    },


    // 반려 처리
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

        // axiosInstance 기본 헤더(Content-Type: application/json)가 FormData의
        // multipart boundary를 덮어써서 500(InvalidContentTypeException)이 나던 문제(BUG-006) -
        // undefined로 지정해 axios가 boundary 포함 헤더를 자동 설정하도록 한다.
        const response = await axiosInstance.post(
            `${BASE_URL}/${workcationNo}`,
            formData,
            { headers: { "Content-Type": undefined } }
        );

        return response.data;
    }
};