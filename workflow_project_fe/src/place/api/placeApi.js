import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/TRV-004/place';

export const placeApi = {

    // 지역 정보 목록 조회
    getPlaceList: async (cpage) => {

        const response = await axios.get(BASE_URL, {
            params: {
                cpage
            }
        });

        return response.data;
    },


    // 지역 정보 검색
    searchPlaceList: async (cpage, keyword) => {

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                cpage,
                keyword
            }
        });

        return response.data;
    },


    // 지역 정보 상세 조회
    getPlaceDetail: async (hubNo) => {

        const response = await axios.get(`${BASE_URL}/${hubNo}`);

        return response.data;
    }

};