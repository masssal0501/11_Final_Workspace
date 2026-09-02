import axiosInstance from "../../common/api/axiosInstance";

const BASE_URL = "/hubs";


// =========================================================
// 거점 목록 조회
// =========================================================
const selectHubListApi = (cpage) => {

    return axiosInstance({
        url: BASE_URL,
        method: "get",
        params: {
            cpage: cpage
        }
    });
};


// =========================================================
// 거점 검색
// =========================================================
const searchHubListApi = (cpage, inputData) => {

    return axiosInstance({
        url: `${BASE_URL}/search`,
        method: "get",
        params: {
            cpage: cpage,
            mainRegion: inputData.mainRegion,
            subRegion: inputData.subRegion,
            hubType: inputData.hubType,
            keyword: inputData.keyword
        }
    });
};


// =========================================================
// 거점 등록
// =========================================================
const insertHubApi = (formData) => {

    return axiosInstance({
        url: BASE_URL,
        method: "post",
        data: formData
    });
};


// =========================================================
// 거점 상세 조회
// =========================================================
const selectHubApi = (hubNo) => {

    return axiosInstance({
        url: `${BASE_URL}/${hubNo}`,
        method: "get"
    });
};


// =========================================================
// 거점 삭제
// =========================================================
const deleteHubApi = (hubNo) => {

    return axiosInstance({
        url: `${BASE_URL}/${hubNo}`,
        method: "delete"
    });
};


// =========================================================
// 거점 수정
// =========================================================
const updateHubApi = (hubNo, formData) => {

    return axiosInstance({
        url: `${BASE_URL}/${hubNo}`,
        method: "put",
        data: formData
    });
};


// =========================================================
// 메시지 전송
// =========================================================
const sendMessageApi = (message) => {

    return axiosInstance({
        url: `${BASE_URL}/send`,
        method: "post",
        data: {
            message: message
        }
    });
};


export {
    selectHubListApi,
    searchHubListApi,
    insertHubApi,
    sendMessageApi,
    selectHubApi,
    deleteHubApi,
    updateHubApi,
    BASE_URL
};