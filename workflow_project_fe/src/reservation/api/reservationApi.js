import axiosInstance from "../../common/api/axiosInstance";


// =========================================================
// RSV-001
// 예약 가능 거점 조회
// =========================================================

export const getAvailableHubs = async ({
    mainRegion,
    subRegion,
    hubType,
    rsvStart,
    rsvEnd,
}) => {

    const response = await axiosInstance.get(
        "/reservations/hubs",
        {
            params: {
                mainRegion,
                subRegion,
                hubType,
                rsvStart,
                rsvEnd,
            },
        }
    );

    return response.data;
};


// =========================================================
// RSV-002
// 예약 가능 일정 조회
// =========================================================

export const getAvailableSchedules = async ({
    hubNo,
    rsvStart,
    rsvEnd,
}) => {

    const response = await axiosInstance.get(
        "/reservations/schedules",
        {
            params: {
                hubNo,
                rsvStart,
                rsvEnd,
            },
        }
    );

    return response.data;
};


// =========================================================
// RSV-003
// 예약 신청
// =========================================================

export const createReservation = async (
    reservationData
) => {

    const response = await axiosInstance.post(
        "/reservations",
        reservationData
    );

    return response.data;
};


// =========================================================
// RSV-004
// 예약 상세 조회
// =========================================================

export const getReservationDetail = async (
    rsvNo
) => {

    const response = await axiosInstance.get(
        `/reservations/${rsvNo}`
    );

    return response.data;
};


// =========================================================
// RSV-005
// 예약 수정
// =========================================================

export const updateReservation = async (
    rsvNo,
    reservationData
) => {

    const response = await axiosInstance.put(
        `/reservations/${rsvNo}`,
        reservationData
    );

    return response.data;
};


// =========================================================
// RSV-006
// 예약 취소
// =========================================================

export const cancelReservation = async (
    rsvNo
) => {

    const response = await axiosInstance.patch(
        `/reservations/${rsvNo}/cancel`
    );

    return response.data;
};


// =========================================================
// 예약 목록 조회
// 워케이션별 예약 목록
// =========================================================

export const getReservationsByWorkcation = async (
    workcationNo
) => {

    const response = await axiosInstance.get(
        `/reservations/workcation/${workcationNo}`
    );

    return response.data;
};
