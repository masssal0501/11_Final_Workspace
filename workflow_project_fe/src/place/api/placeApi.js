import axiosInstance from "../../common/api/axiosInstance";

const BASE_URL = "/place";

export const placeApi = {

    // 장소 목록 조회
    getPlaceList: async (
        cpage = 1,
        type = "",
        region = "",
        subRegion = ""
    ) => {

        const response = await axiosInstance.get(
            BASE_URL,
            {
                params: {
                    cpage,
                    type,
                    region,
                    subRegion
                }
            }
        );

        return response.data;
    },


    // 장소 검색
    searchPlaceList: async (
        cpage = 1,
        keyword = "",
        type = "",
        region = "",
        subRegion = ""
    ) => {

        const response = await axiosInstance.get(
            BASE_URL,
            {
                params: {
                    cpage,
                    keyword,
                    type,
                    region,
                    subRegion
                }
            }
        );

        return response.data;
    },


    // 장소 상세 조회
    getPlaceDetail: async (hubNo) => {

        const response =
            await axiosInstance.get(
                `${BASE_URL}/${hubNo}`
            );

        return response.data;
    },


    // 장소 등록
    insertPlace: async (formData) => {

        const response =
            await axiosInstance.post(
                BASE_URL,
                formData
            );

        return response.data;
    },


    // 장소 수정
    updatePlace: async (hubNo, formData) => {

        const response =
            await axiosInstance.put(
                `${BASE_URL}/${hubNo}`,
                formData
            );

        return response.data;
    },


    // 장소 종료
    deletePlace: async (hubNo) => {

        const response =
            await axiosInstance.delete(
                `${BASE_URL}/${hubNo}`
            );

        return response.data;
    }

};