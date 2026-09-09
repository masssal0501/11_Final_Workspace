import axios from "axios";
axios.defaults.withCredentials = true;
const BASE_URL = '/workflow';

//1.메인지역
export const getMainRegionList = async () => {
    const response = await axios.get(
        `${BASE_URL}/workcation/hub/mainRegion`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );

    return response.data;
};
//서브
export const getSubRegionList = async (mainRegion) => {
    const response = await axios.get(
        `${BASE_URL}/workcation/hub/subRegion`,
        {
            params: { mainRegion },
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );

    return response.data;
};

//워케이션 목록 조회 
export const getWorkcationList = async (params) => {
    const response = await axios.get(`${BASE_URL}/workcation/list`, {
        params: params,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    });
    return response.data;
};

//상세조회
export const getWorkcationDetail = async (workcationNo) => {
    const response = await axios.get(
        `${BASE_URL}/workcation/detail/${workcationNo}`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );

    return response.data;
};
//워케이션 등록
export const enrollWorkcation = async (insertworkcationData) => {
    const response = await axios.post(`${BASE_URL}/workcation/hub/enrollForm`,
        insertworkcationData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    }
    );
    return response;
}

//내 워케이션 리스트
export const getMyWorkcationList = async (params) => {

    const response = await axios.get(
        `${BASE_URL}/workcation/mylist`,
        {
            params,
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );

    return response.data;
};

// 내 워케이션 상세조회
export const getMyWorkcationDetail = async (workcationNo) => {
    const response = await axios.get(`${BASE_URL}/workcation/mydetail/${workcationNo}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    });
    return response.data;
};

//수정
export const updateWorkcation = async (workcationNo, data) => {

    const token = localStorage.getItem("accessToken");

    const response = await axios.put(
        `${BASE_URL}/workcation/update/${workcationNo}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//삭제
export const deleteWorkcation = async (workcationNo) => {
    const response = await axios.delete(`${BASE_URL}/workcation/delete/${workcationNo}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    })

    return response.data;
}

//회사 지우너금 정보조회
export const getSupportInfo = async () => {
    const response = await axios.get(
        `${BASE_URL}/workcation/amount/supportInfo`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );
    return response.data;
};

//거점 및 옵션장소 조회
export const getHubList = async (params) => {
    const response = await axios.get(
        `${BASE_URL}/workcation/hub/list`,
        {
            params: params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );

    return response.data;
};

// 진행률 저장
export const saveTaskProgress = async (data, file) => {

    const token = localStorage.getItem("accessToken");

    console.log("saveTaskProgress token =", token);
    console.log("saveTaskProgress data =", data);

    const formData = new FormData();

    formData.append("progress", data.progress);
    formData.append("title", data.title);
    formData.append("content", data.content);

    if (file) {
        formData.append("file", file);
    }

    console.log("FormData =", [...formData.entries()]);

    const response = await axios({
        method: "PUT",
        url: `${BASE_URL}/workcation/task/${data.taskNo}`,
        data: formData,

        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

//워케이션 리스트 일정 조회
export const getWorkcationSchedule = async (date) => {

    const token = localStorage.getItem("accessToken");
    console.log("schedule token =", token);

    const response = await axios.get(
        `${BASE_URL}/workcation/schedule`,
        {
            params: { date: date },
            headers: { Authorization: `Bearer ${token}` }
        }
    )
    return response.data;
}

//내 워케이션 첨부파일업로드
export const uploadWorkFile = async (workcationNo, file) => {

    const token = localStorage.getItem("accessToken");

    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
        `${BASE_URL}/workcation/${workcationNo}/file`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//첨부 다운로드
export const downloadWorkFile = async (taskFileNo, originName) => {

    const token = localStorage.getItem("accessToken");

    const response = await axios.get(
        `${BASE_URL}/workcation/file/${taskFileNo}/download`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: "blob"
        }
    );

    const url = window.URL.createObjectURL(
        new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = originName;

    document.body.appendChild(link);

    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};
