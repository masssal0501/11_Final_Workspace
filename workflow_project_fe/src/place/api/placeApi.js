import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/TRV-004/place';

export const placeApi = {

    // 장소 정보 목록 조회
    getPlaceList: async (cpage, type, region) => {

        const response = await axios.get(BASE_URL, {
            params: {
                cpage,
                type,
                region
            }
        });

        return response.data;
    },


    // 장소 정보 검색
    searchPlaceList: async (cpage, keyword, type, region) => {

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                cpage,
                keyword,
                type,
                region
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
    insertPlace: async (place) => {

        const response = await axios.post(
            BASE_URL,
            place
        );

        return response.data;
    },

    // 지역 정보 수정
    updatePlace: async (hubNo, place) => {

        const response = await axios.put(
            `${BASE_URL}/${hubNo}`,
            place
        );

        return response.data;
    }


};