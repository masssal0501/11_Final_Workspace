import axios from "axios";

const API_BASE_URL =
    "http://localhost:8006/workflow/api/v1/amounts";


const amountApi = {

    // =========================================================
    // 1. 전체 비용 신청 목록
    // =========================================================
    getAmountList: async (page = 1) => {

        const response = await axios.get(
            API_BASE_URL,
            {
                params: {
                    page
                },
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 2. 워케이션별 비용 신청 목록
    // =========================================================
    getAmountListByWorkcation: async (
        workcationNo,
        page = 1
    ) => {

        const response = await axios.get(
            `${API_BASE_URL}/workcation/${workcationNo}`,
            {
                params: {
                    page
                },
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 3. 비용 상세 조회
    // =========================================================
    getAmountById: async (amountNo) => {

        const response = await axios.get(
            `${API_BASE_URL}/${amountNo}`,
            {
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 4. 비용 신청 등록
    // =========================================================
    insertAmount: async (formData) => {

        const response = await axios.post(
            API_BASE_URL,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 5. 비용 신청 수정
    // =========================================================
    updateAmount: async (
        amountNo,
        formData
    ) => {

        const response = await axios.put(
            `${API_BASE_URL}/${amountNo}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            }
        );

        return response.data;
    },


   // =========================================================
// 6. 결재 상태 변경 + 지원금 반영
// =========================================================
updateApproval: async (
    amountNo,
    status,
    approvedAmount,
    amountComment,
    sponsorName,
    sponsorAmount,
    sponsorStatus,
    remark
) => {

    const data = {
        status,
        approvedAmount,
        amountComment,
        sponsorName,
        sponsorAmount,
        sponsorStatus,
        remark
    };

    console.log("📌 승인 요청:", {
        amountNo,
        data
    });

    const response = await axios.patch(
        `${API_BASE_URL}/${amountNo}/approval`,
        data,
        {
            withCredentials: true
        }
    );

    return response.data;
},

    // =========================================================
    // 7. 비용 신청 취소
    // =========================================================
    cancelAmount: async (amountNo) => {

        const response = await axios.patch(
            `${API_BASE_URL}/${amountNo}/cancel`,
            {},
            {
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 8. 첨부파일 삭제
    // =========================================================
    deleteFile: async (
        amountNo,
        amountattachmentNo
    ) => {

        const response = await axios.delete(
            `${API_BASE_URL}/${amountNo}/files/${amountattachmentNo}`,
            {
                withCredentials: true
            }
        );

        return response.data;
    },


    // =========================================================
    // 9. 통계
    // =========================================================
    getStatistics: async () => {

        const response = await axios.get(
            `${API_BASE_URL}/statistics`,
            {
                withCredentials: true
            }
        );

        return response.data;
    }
};


// =========================================================
// Export
//
// named import 가능
// import { amountApi } from "./api/amountApi";
//
// default import도 가능
// import amountApi from "./api/amountApi";
// =========================================================

export { amountApi };

export default amountApi;