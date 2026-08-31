import axiosInstance from "../../common/api/axiosInstance"

const BASE_URL = 'http://localhost:8006/workflow/hubs';

const selectHubListApi = cpage => {

    const response = axiosInstance({
        url : `${ BASE_URL }`,
        method : "get",
        params : {
            cpage : cpage
        }
    });

    return response;
};

const searchHubListApi = (cpage, inputData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/search`,
        method : "get",
        params : {
            cpage : cpage,
            mainRegion : inputData.mainRegion,
            subRegion : inputData.subRegion,
            hubType : inputData.hubType,
            keyword : inputData.keyword
        }
    });

    return response;
}

const insertHubApi = formData => {

    const response = axiosInstance({
       url : `${ BASE_URL }`,
       method : "post",
       data : formData,
       headers : {
            "Content-Type" : "multipart/form-data"
       } 
    });

    return response;
}

const selectHubApi = hubNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "get"
    });

    return response;
}

const deleteHubApi = hubNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "delete"
    });

    return response;
}

const updateHubApi = (hubNo, formData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "put",
        data : formData,
        headers : {
            "Content-Type" : "multipart/form-data"
        }
    });

    return response;
}

const sendMessageApi = message => {
    
    const response = axiosInstance({
        url : `${ BASE_URL }/send`,
        method : "post",
        data : {
            message : message
        }
    });

    return response;
}

export { selectHubListApi, searchHubListApi, insertHubApi, sendMessageApi, selectHubApi, deleteHubApi, updateHubApi };
export { BASE_URL }