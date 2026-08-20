import axios from "axios";

const BASE_URL = 'http://localhost:8001/workflow/hubs';

const selectHubListApi = cpage => {

    const response = axios({
        url : `${ BASE_URL }`,
        method : "get",
        params : {
            cpage : cpage
        }
    });

    return response;
};

const searchHubListApi = (cpage, inputData) => {

    const response = axios({
        url : `${ BASE_URL }/search`,
        method : "get",
        params : {
            cpage : cpage,
            regionName : inputData.regionName,
            hubType : inputData.hubType,
            keyword : inputData.keyword
        }
    });

    return response;
}

const insertHubApi = FormData => {

    const response = axios({
       url : `${ BASE_URL }`,
       method : "post",
       data : FormData,
       headers : {
            "Content-Type" : "multipart/form-data"
       } 
    });

    return response;
}

const sendMessageApi = message => {
    
    const response = axios({
        url : `${ BASE_URL }/send`,
        method : "post",
        data : {
            message : message
        }
    });

    return response;
}

export { selectHubListApi, searchHubListApi, insertHubApi, sendMessageApi };