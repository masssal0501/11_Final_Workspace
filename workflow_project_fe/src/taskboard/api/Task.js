import axiosInstance from "../../common/api/axiosInstance";

// 목록
export const getTaskList = async ({ cpage, condition, keyword }) => {
    const response = await axiosInstance.get("/task/list", {
        params: {
            cpage,
            condition,
            keyword
        }
    });

    return response.data;
};

// 워케이션별 업무
export const getWorkcationTasks = async (workcationNo) => {
    const response = await axiosInstance.get(`/task/workcation/${workcationNo}`);

    return response.data;
};

//업무상세 내역 승인
export const updateTaskStatus = async (taskNo, status, content = "") => {
    const response = await axiosInstance.patch(
        `/task/${taskNo}/status`,
        { status, content }
    );

    return response.data;
}
