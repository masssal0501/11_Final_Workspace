import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/TRV-004/place';

export const programApi = {

    // 체험프로그램 목록 조회
    getProgramList: async (cpage) => {

        const response = await axios.get(BASE_URL, {
            params: {
                cpage
            }
        });

        return response.data;
    },


    // 체험프로그램 검색
    searchProgramList: async (cpage, keyword) => {

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                cpage,
                keyword
            }
        });

        return response.data;
    },


    // 체험프로그램 상세 조회
    getProgramDetail: async (hubNo) => {

        const response = await axios.get(`${BASE_URL}/${hubNo}`);

        return response.data;
    }

};