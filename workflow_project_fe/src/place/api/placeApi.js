import axiosInstance from "../../common/api/axiosInstance";

const BASE_URL = "/place";

export const placeApi = {

    // 장소 정보 목록 조회
    getPlaceList: async (cpage, type, region, subRegion) => {

        const response = await axiosInstance.get(BASE_URL, {
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
    searchPlaceList: async (
        cpage,
        keyword,
        type,
        region,
        subRegion
    ) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/search`,
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


    // 장소 정보 상세 조회
    getPlaceDetail: async (hubNo) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/${hubNo}`
        );

        return response.data;
    },


    // 장소 정보 등록
    insertPlace: async (formData) => {

        const response = await axiosInstance.post(
            BASE_URL,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    },


    // 장소 정보 수정
    updatePlace: async (hubNo, formData) => {

        const response = await axiosInstance.put(
            `${BASE_URL}/${hubNo}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    }

};
