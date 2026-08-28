import axios from "axios";

const API_URL = "/api/v1/notice";

export const noticeApi = {

   // 목록 (검색 조건 포함)
    getNoticeList: async (page, limit, condition, keyword) => {
        const response = await axios.get(`${API_URL}`, {
            params: { page, limit, condition, keyword }
        });
        return response.data;
    },

    // 상세
    getNoticeDetail: async (noticeNo) => {
        const response = await axios.get(`${API_URL}/${noticeNo}`);
        return response.data;
    },

    // 등록
    insertNotice: async (formData) => {
        const response = await axios.post(`${API_URL}`, formData);
        return response.data;
    },

    // 수정
    updateNotice: async (noticeNo, formData) => {
        const response = await axios.put(`${API_URL}/${noticeNo}`, formData);
        return response.data;
    },

    // 삭제
    deleteNotice: async (noticeNo) => {
        const response = await axios.delete(`${API_URL}/${noticeNo}`);
        return response.data;
    },

    // 파일 다운로드
    getFileDownloadUrl: (noticefileNo) => {
        return `${API_URL}/file/${noticefileNo}`;
    }
};