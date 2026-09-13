import axiosInstance from "../../common/api/axiosInstance";

const API_BASE_URL = "/api/v1/amounts";

const amountApi = {

    // =========================================================
    // 1. 전체 비용 신청 목록
    // GET /api/v1/amounts?page=0 (Spring Pageable은 0부터 시작)
    // =========================================================
    getAmountList: async (page = 1) => {

        const response = await axiosInstance.get(
            API_BASE_URL,
            {
                params: {
                    page: page - 1
                }
            }
        );

        return response.data;
    },


    // =========================================================
    // 2. 로그인 사용자 비용 신청 목록
    //
    // GET /api/v1/amounts/my
    //
    // 로그인 사용자
    //      ↓
    // 본인 워케이션
    //      ↓
    // 해당 워케이션의 비용 신청 내역
    // =========================================================
    getMyAmountList: async (page = 1) => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/my`,
            {
                params: {
                    page: page - 1
                }
            }
        );

        return response.data;
    },


    // =========================================================
    // 3. 워케이션별 비용 신청 목록
    // GET /api/v1/amounts/workcation/{workcationNo}?page=0
    // =========================================================
    getAmountListByWorkcation: async (
        workcationNo,
        page = 1
    ) => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/workcation/${workcationNo}`,
            {
                params: {
                    page: page - 1
                }
            }
        );

        return response.data;
    },


    // =========================================================
    // 4. 비용 상세 조회
    // GET /api/v1/amounts/{amountNo}
    // =========================================================
    getAmountById: async (amountNo) => {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/${amountNo}`
        );

        return response.data;
    },


    // =========================================================
    // 5. 비용 신청 등록
    // POST /api/v1/amounts
    // =========================================================
    insertAmount: async (formData) => {

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
    // 6. 비용 신청 수정
    // PUT /api/v1/amounts/{amountNo}
    // =========================================================
    updateAmount: async (
        amountNo,
        formData
    ) => {

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
    // 7. 결재 상태 변경 + 지원금 반영
    // PATCH /api/v1/amounts/{amountNo}/approval
    // =========================================================
    updateApproval: async (
    amountNo,
    status,
    approvedAmount,
    amountComment,
    itemSupports = []   // [{ itemNo, amount }, ...]
) => {

    const params = {
        status,
        approvedAmount,
        comment: amountComment
    };

    const response = await axiosInstance.patch(
        `${API_BASE_URL}/${amountNo}/approval`,
        { itemSupports },   // body로 전송
        { params }
    );

    return response.data;
},

// =========================================================
// 항목별 회사 지원금 저장 (승인 전 임시 저장)
// PATCH /api/v1/amounts/item/{itemNo}/support
// =========================================================
updateItemSupport: async (itemNo, amountNo, amount) => {

    const response = await axiosInstance.patch(
        `${API_BASE_URL}/item/${itemNo}/support`,
        null,
        {
            params: { amountNo, amount }
        }
    );

    return response.data;
},


    // =========================================================
    // 8. 비용 신청 취소
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
    // 9. 첨부파일 삭제
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
    // 10. 통계
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