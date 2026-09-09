import axiosInstance from "../../common/api/axiosInstance";

/**
 * 출근/퇴근 처리 (위치 인증 완료 후 호출)
 * @param {Object} data - { workcationNo, hubNo, checkType, latitude, longitude, distanceM }
 */
export const checkAttendanceApi = (data) => {
    return axiosInstance({
        url: "/attendance/check",
        method: "post",
        data
    });
};
