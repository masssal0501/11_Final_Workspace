import axiosInstance from "../../common/api/axiosInstance";

const API_URL = "/api/v1/notice";

export const noticeApi = {

    // =========================================================
    // 공지사항 목록
    // GET /api/v1/notice?page=1&limit=10&condition=title&keyword=
    // =========================================================
    getNoticeList: async (
        page = 1,
        limit = 10,
        condition = "title",
        keyword = ""
    ) => {

        const response = await axiosInstance.get(API_URL, {
            params: {
                page,
                limit,
                condition,
                keyword
            }
        });

        return response.data;
    },

    // =========================================================
    // 공지사항 상세
    // GET /api/v1/notice/{noticeNo}
    // =========================================================
    getNoticeDetail: async (noticeNo) => {

        const response = await axiosInstance.get(
            `${API_URL}/${noticeNo}`
        );

        return response.data;
    },


    deleteFile: async (noticefileNo) => {
    const response = await axiosInstance.delete(
        `${API_URL}/file/${noticefileNo}`
    );
    return response.data;
},
    // =========================================================
    // 공지사항 등록
    // POST /api/v1/notice
    // =========================================================
    insertNotice: async (formData) => {

        const response = await axiosInstance.post(
            API_URL,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 공지사항 수정
    // PUT /api/v1/notice/{noticeNo}
    // =========================================================
    updateNotice: async (noticeNo, formData) => {

        const response = await axiosInstance.put(
            `${API_URL}/${noticeNo}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    },

    // =========================================================
    // 공지사항 삭제
    // DELETE /api/v1/notice/{noticeNo}
    // =========================================================
    deleteNotice: async (noticeNo) => {

        const response = await axiosInstance.delete(
            `${API_URL}/${noticeNo}`
        );

        return response.data;
    },

    // =========================================================
    // 파일 다운로드 URL
    // =========================================================
    getFileDownloadUrl: (noticefileNo) => {

        return `${API_URL}/file/${noticefileNo}`;
    },

    // =========================================================
// 공지사항 수정용 조회 (조회수 증가 없음)
// GET /api/v1/notice/{noticeNo}/edit
// =========================================================
getNoticeForEdit: async (noticeNo) => {

    const response = await axiosInstance.get(
        `${API_URL}/${noticeNo}/edit`
    );

    return response.data;
},
};