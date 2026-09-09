import axiosInstance from "../../common/api/axiosInstance";

const API_BASE_URL = "/api/v1/amounts";

const amountApi = {

    // =========================================================
    // 1. 전체 비용 신청 목록
    // GET /api/v1/amounts?page=1
    // =========================================================
    getAmountList: async (page = 1) => {

        const response = await axiosInstance.get(
            API_BASE_URL,
            {
                params: {
                    page
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 2. 워케이션별 비용 신청 목록
    // GET /api/v1/amounts/workcation/{workcationNo}?page=1
    // =========================================================
    getAmountListByWorkcation: async (
        workcationNo,
        page = 1
    ) => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/workcation/${workcationNo}`,
            {
                params: {
                    page
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 3. 비용 상세 조회
    // GET /api/v1/amounts/{amountNo}
    // =========================================================
    getAmountById: async (amountNo) => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/${amountNo}`
        );

        return response.data;
    },

    // =========================================================
    // 4. 비용 신청 등록
    // POST /api/v1/amounts
    // =========================================================
    insertAmount: async (formData) => {

        // Content-Type을 명시하지 않아야 axiosInstance의 기본값(application/json)이
        // 덮어써지지 않고, 브라우저가 FormData를 보고 boundary가 포함된
        // multipart/form-data Content-Type을 자동으로 설정한다.
        // (여기서 "multipart/form-data"를 직접 지정하면 boundary가 빠져 서버가
        //  파트를 구분하지 못해 요청이 깨진다)
        const response = await axiosInstance.post(
            API_BASE_URL,
            formData,
            {
                headers: {
                    "Content-Type": undefined
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 5. 비용 신청 수정
    // PUT /api/v1/amounts/{amountNo}
    // =========================================================
    updateAmount: async (
        amountNo,
        formData
    ) => {

        // insertAmount와 동일한 이유로 Content-Type을 직접 지정하지 않는다.
        const response = await axiosInstance.put(
            `${API_BASE_URL}/${amountNo}`,
            formData,
            {
                headers: {
                    "Content-Type": undefined
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 6. 결재 상태 변경 + 지원금 반영
    // PATCH /api/v1/amounts/{amountNo}/approval
    // =========================================================
    updateApproval: async (
        amountNo,
        status,
        approvedAmount,
        amountComment
    ) => {

        // BUG-013: 백엔드 AmountController.updateApproval()은
        // @RequestParam(status, approvedAmount, comment)로 값을 받는데
        // 여기서는 axios.patch(url, data)로 JSON 바디를 보내고 있어
        // @RequestParam이 절대 바인딩되지 않고 항상 400
        // "Required parameter 'status' is not present"로 실패했다.
        // ADMIN 승인/반려/보류 버튼이 전부 동작하지 않던 원인이므로
        // 쿼리 파라미터로 전송하도록 수정한다. (comment 파라미터명도
        // 프론트의 amountComment와 달라 함께 맞춘다)
        const params = {
            status,
            approvedAmount,
            comment: amountComment
        };

        const response = await axiosInstance.patch(
            `${API_BASE_URL}/${amountNo}/approval`,
            null,
            { params }
        );

        return response.data;
    },

    // =========================================================
    // 7. 비용 신청 취소
    // PATCH /api/v1/amounts/{amountNo}/cancel
    // =========================================================
    cancelAmount: async (amountNo) => {

        const response = await axiosInstance.patch(
            `${API_BASE_URL}/${amountNo}/cancel`,
            {}
        );

        return response.data;
    },

    // =========================================================
    // 8. 첨부파일 삭제
    // DELETE /api/v1/amounts/{amountNo}/files/{amountattachmentNo}
    // =========================================================
    deleteFile: async (
        amountNo,
        amountattachmentNo
    ) => {

        const response = await axiosInstance.delete(
            `${API_BASE_URL}/${amountNo}/files/${amountattachmentNo}`
        );

        return response.data;
    },

    // =========================================================
    // 9. 통계
    // GET /api/v1/amounts/statistics
    // =========================================================
    getStatistics: async () => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/statistics`
        );

        return response.data;
    }
};

export { amountApi };

export default amountApi;
