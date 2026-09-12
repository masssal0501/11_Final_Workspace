import axiosInstance from "../../common/api/axiosInstance";

// 후기 작성 가능 여부(본인 소유 / 승인 여부 / 종료 여부 / 기작성 여부)
export const getReviewStatus = async (workcationNo) => {
    const response = await axiosInstance.get(`/workcation/review/status/${workcationNo}`);
    return response.data;
};

// 워케이션 후기 조회 (없으면 null)
export const getReview = async (workcationNo) => {
    const response = await axiosInstance.get(`/workcation/review/${workcationNo}`);
    if (response.status === 204) return null;
    return response.data;
};

// 내가 작성한 후기 목록
export const getMyReviews = async () => {
    const response = await axiosInstance.get("/workcation/review/my");
    return response.data;
};

// 후기 제출 (사진은 선택)
export const submitReview = async (workcationNo, rating, content, photo) => {
    const formData = new FormData();
    formData.append("workcationNo", workcationNo);
    formData.append("rating", rating);
    formData.append("content", content);
    if (photo) {
        formData.append("photo", photo);
    }

    const response = await axiosInstance.post("/workcation/review", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};
