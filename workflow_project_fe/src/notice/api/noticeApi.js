import axios from 'axios';

const API_BASE_URL = '/api/notice';

export const noticeApi = {

    // 공지사항 목록
    getNoticeList: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    // 공지사항 상세
    getNoticeDetail: async (noticeNo) => {
        const response = await axios.get(
            `${API_BASE_URL}/${noticeNo}`
        );
        return response.data;
    },

    // 공지사항 등록
    insertNotice: async (noticeData) => {
        const response = await axios.post(
            API_BASE_URL,
            noticeData
        );
        return response.data;
    },

    // 공지사항 수정
    updateNotice: async (noticeNo, noticeData) => {
        const response = await axios.put(
            `${API_BASE_URL}/${noticeNo}`,
            noticeData
        );
        return response.data;
    },

    // 공지사항 삭제
    deleteNotice: async (noticeNo) => {
        const response = await axios.delete(
            `${API_BASE_URL}/${noticeNo}`
        );
        return response.data;
    }

};