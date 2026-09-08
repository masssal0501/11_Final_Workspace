import axios from "axios";

const BASE_URL = "/workflow";

// 목록
export const getTaskList = async ({ cpage, condition, keyword }) => {
    const token = localStorage.getItem("accessToken");

    const response = await axios.get(`${BASE_URL}/task/list`, {
        params: {
            cpage,
            condition,
            keyword
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// 워케이션별 업무
export const getWorkcationTasks = async (workcationNo) => {
    const token = localStorage.getItem("accessToken");

    console.log("업무 상세 토큰:", token);

    const response = await axios({
        method: "GET",
        url: `${BASE_URL}/task/workcation/${workcationNo}`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};