import axiosInstance from "../../common/api/axiosInstance"

/**
 * 워케이션 허브(Hub) 관련 API 통신을 위한 기본 URL
 *
 * axios 요청 config의 url이 절대경로면 axiosInstance의 baseURL이 무시되므로
 * 여기서도 동일하게 VITE_API_BASE_URL을 사용해 배포 환경에 맞춘다.
 */
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8006/workflow";

const BASE_URL = `${API_BASE_URL}/hubs`;

/**
 * [목록 조회] 허브 전체 목록을 조회합니다. (페이징 처리 포함)
 * @param {number} cpage - 현재 페이지 번호
 * @returns {Promise} Axios 응답(Response) 객체
 */
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

/**
 * [검색 조회] 검색 조건에 맞는 허브 목록을 조회합니다.
 * @param {number} cpage - 현재 페이지 번호
 * @param {Object} inputData - 검색 조건 데이터 (지역, 유형, 키워드 등)
 * @returns {Promise} Axios 응답(Response) 객체
 */
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

/**
 * [등록] 새로운 허브 정보를 등록합니다. (이미지 등 파일 업로드 포함)
 * @param {FormData} formData - 허브 입력 정보 및 첨부 파일이 담긴 FormData 객체
 * @returns {Promise} Axios 응답(Response) 객체
 */
const insertHubApi = formData => {

    const response = axiosInstance({
       url : `${ BASE_URL }`,
       method : "post",
       data : formData,
       headers : {
            // 파일 업로드를 위해 Content-Type을 multipart/form-data로 지정
            "Content-Type" : "multipart/form-data"
       } 
    });

    return response;
}

/**
 * [상세 조회] 특정 허브의 상세 정보를 조회합니다.
 * @param {number|string} hubNo - 조회할 허브의 고유 번호(PK)
 * @returns {Promise} Axios 응답(Response) 객체
 */
const selectHubApi = hubNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "get"
    });

    return response;
}

/**
 * [삭제] 특정 허브 정보를 삭제합니다.
 * @param {number|string} hubNo - 삭제할 허브의 고유 번호(PK)
 * @returns {Promise} Axios 응답(Response) 객체
 */
const deleteHubApi = hubNo => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "delete"
    });

    return response;
}

/**
 * [수정] 기존 허브 정보를 수정합니다. (이미지 등 파일 업로드 포함)
 * @param {number|string} hubNo - 수정할 허브의 고유 번호(PK)
 * @param {FormData} formData - 수정할 데이터 및 첨부 파일이 담긴 FormData 객체
 * @returns {Promise} Axios 응답(Response) 객체
 */
const updateHubApi = (hubNo, formData) => {

    const response = axiosInstance({
        url : `${ BASE_URL }/${ hubNo }`,
        method : "put",
        data : formData,
        headers : {
            // 파일 업로드를 위해 Content-Type을 multipart/form-data로 지정
            "Content-Type" : "multipart/form-data"
        }
    });

    return response;
}

/**
 * [메시지 전송] 허브 관련 메시지 또는 AI 프롬프트를 서버로 전송합니다.
 * @param {string} message - 전송할 메시지 내용
 * @returns {Promise} Axios 응답(Response) 객체
 */
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

// 작성한 API 호출 함수 및 기본 URL을 외부에서 사용할 수 있도록 내보내기(Export)
export { selectHubListApi, searchHubListApi, insertHubApi, sendMessageApi, selectHubApi, deleteHubApi, updateHubApi };
export { BASE_URL }