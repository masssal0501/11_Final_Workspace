import axios from 'axios';

const BASE_URL = '/workflow/api/TRV-004/place';


export const placeApi = {

    // 장소 정보 목록 조회
    getPlaceList: async (cpage, type, region, subRegion) => {

        const response = await axios.get(BASE_URL, {
            params: {
                cpage,
                type,
                region,
                subRegion
            }
        });

        return response.data;
    },


    // 장소 정보 검색
    searchPlaceList: async (cpage, keyword, type, region, subRegion) => {

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                cpage,
                keyword,
                type,
                region,
                subRegion
            }
        });

        return response.data;
    },


    // 장소 정보 상세 조회
    getPlaceDetail: async (hubNo) => {

        const response = await axios.get(`${BASE_URL}/${hubNo}`);

        return response.data;
    },


    // 장소 정보 등록
    insertPlace: async (formData) => {

        const response = await axios.post(
            BASE_URL,
            formData
        );

        return response.data;
    },


    // 장소 정보 수정
    updatePlace: async (hubNo, formData) => {

        const response = await axios.put(
            `${BASE_URL}/${hubNo}`,
            formData
        );

        return response.data;
    }

};