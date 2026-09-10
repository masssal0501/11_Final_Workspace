import axiosInstance from "../../common/api/axiosInstance";

// 만족도 조사 질문 목록
export const getSurveyQuestions = async () => {
    const response = await axiosInstance.get("/survey/questions");
    return response.data;
};

// 만족도 조사 작성 가능 여부(본인 소유 / 승인 여부 / 종료 여부 / 기작성 여부)
export const getSurveyStatus = async (workcationNo) => {
    const response = await axiosInstance.get(`/survey/status/${workcationNo}`);
    return response.data;
};

// 만족도 조사 제출
export const submitSurvey = async (workcationNo, answers) => {
    const response = await axiosInstance.post("/survey", {
        workcationNo,
        answers
    });
    return response.data;
};
