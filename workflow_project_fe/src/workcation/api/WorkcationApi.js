import axios from "axios";
axios.defaults.withCredentials = true;
const BASE_URL = '/workflow';

//1.메인지역
export const getMainRegionList = async () =>{
    const response = await axios.get(`${BASE_URL}/workcation/hub/mainRegion`);
    return response.data;
};

//서브(상세) 지역 
export const getSubRegionList = async (mainRegion) => {
    const response = await axios.get(`${BASE_URL}/workcation/hub/subRegion`, {
        params: { mainRegion }
    });
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
    const response = await axios.get(`${BASE_URL}/workcation/MyWorkcation/${workcationNo}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    });
    return response.data;
}
//워케이션 등록
export const enrollWorkcation = async (insertworkcationData)=>{
    const response = await axios.post(`${BASE_URL}/workcation/hub/enrollForm`, 
        insertworkcationData, {
            headers:{
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
    );
    return response;
}

// 내 워케이션 조회
export const getMyWorkcation = async () => {
    const response = await axios.get(`${BASE_URL}/workcation/my`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    });
    return response.data;
};

//수정
export const updateWorkcation = async(workcationNo, updateData) => {
    const response = await axios.put(`${BASE_URL}/workcation/update/${workcationNo}`, updateData);
    return response;
}

//삭제
export const deleteWorkcation = async(workcationNo)=>{
    const response = await axios.delete(`${BASE_URL}/workcation/delete/${workcationNo}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    })
    
    return response.data;
}

//회사 지우너금 정보조회
export const getSupportInfo = async () => {
    const response = await axios.get(`${BASE_URL}/workcation/amount/supportInfo`);
    return response.data;
}

//거점 및 옵션장소 조회
export const getHubList =async(params)=>{
    const response = await axios.get(`${BASE_URL}/workcation/hub/list`, {params:params})
    return response.data;
}

