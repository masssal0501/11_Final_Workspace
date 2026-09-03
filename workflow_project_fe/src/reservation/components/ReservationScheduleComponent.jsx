import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    getHub,
    getAvailableSchedules
} from "../api/reservationApi";

import "../styles/ReservationSchedule.css";

function ReservationScheduleComponent() {

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const hubNo = params.get("hubNo");

    const [hub, setHub] = useState(null);
    const [reservations, setReservations] = useState([]);

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [loading, setLoading] = useState(false);


    // =====================================================
    // 시설 정보 조회
    // =====================================================

    useEffect(() => {

        if (!hubNo) {
            return;
        }

        const fetchHub = async () => {

            try {

                const data = await getHub(hubNo);

                console.log("시설 정보:", data);

                setHub(data.hub);

            } catch (error) {

                console.error("시설 정보 조회 실패:", error);

            }

        };

        fetchHub();

    }, [hubNo]);


    // =====================================================
    // 예약 현황 조회
    // =====================================================

    useEffect(() => {

        if (!hubNo || !selectedDate) {
            return;
        }

        const fetchSchedules = async () => {

            try {

                setLoading(true);

                const rsvStart = `${selectedDate}T00:00:00`;
                const rsvEnd = `${selectedDate}T23:59:59`;

                const data = await getAvailableSchedules({
                    hubNo,
                    rsvStart,
                    rsvEnd
                });

                console.log("예약 현황:", data);

                setReservations(data);

                // 날짜 변경 시 선택 슬롯 초기화
                setSelectedSlot(null);

            } catch (error) {

                console.error(
                    "예약 현황 조회 실패:",
                    error
                );

                setReservations([]);

            } finally {

                setLoading(false);

            }

        };

        fetchSchedules();

    }, [hubNo, selectedDate]);


    // =====================================================
    // 시간 슬롯 생성
    // =====================================================

    const createTimeSlots = () => {

        const slots = [];

        for (let hour = 9; hour < 18; hour++) {

            const start = `${String(hour).padStart(2, "0")}:00`;
            const end = `${String(hour + 1).padStart(2, "0")}:00`;

            slots.push({
                start,
                end
            });
        }

        return slots;
    };


    const timeSlots = createTimeSlots();


    // =====================================================
    // 해당 시간대 예약 여부 확인
    // =====================================================

    const isReserved = (slot) => {

        const slotStart = new Date(
            `${selectedDate}T${slot.start}:00`
        );

        const slotEnd = new Date(
            `${selectedDate}T${slot.end}:00`
        );

        return reservations.some((reservation) => {

            // N = 예약 상태
            if (reservation.rsvStatus !== "N") {
                return false;
            }

            const reservationStart =
                new Date(reservation.rsvStart);

            const reservationEnd =
                new Date(reservation.rsvEnd);

            // 시간 겹침 확인
            return (
                reservationStart < slotEnd &&
                reservationEnd > slotStart
            );

        });
    };


    // =====================================================
    // 슬롯 선택
    // =====================================================

    const handleSlotClick = (slot) => {

        if (isReserved(slot)) {
            return;
        }

        setSelectedSlot(slot);

    };


    // =====================================================
    // 예약 신청
    // =====================================================

    const handleReservation = () => {

        if (!selectedSlot) {
            alert("예약할 시간을 선택해주세요.");
            return;
        }

        const rsvStart =
            `${selectedDate}T${selectedSlot.start}:00`;

        const rsvEnd =
            `${selectedDate}T${selectedSlot.end}:00`;

        navigate(
            `/reservations/enroll?hubNo=${hubNo}&rsvStart=${encodeURIComponent(rsvStart)}&rsvEnd=${encodeURIComponent(rsvEnd)}`
        );

    };


    // =====================================================
    // 이전 날짜
    // =====================================================

    const handlePreviousDate = () => {

        const date = new Date(selectedDate);

        date.setDate(date.getDate() - 1);

        setSelectedDate(
            date.toISOString().slice(0, 10)
        );

    };


    // =====================================================
    // 다음 날짜
    // =====================================================

    const handleNextDate = () => {

        const date = new Date(selectedDate);

        date.setDate(date.getDate() + 1);

        setSelectedDate(
            date.toISOString().slice(0, 10)
        );

    };


    return (
        <div className="reservation-schedule-container">

            {/* =========================================
                페이지 제목
            ========================================= */}

            <div className="schedule-header">

                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← 이전
                </button>

                <h1>예약 일정 조회</h1>

            </div>


            {/* =========================================
                시설 정보
            ========================================= */}

            {hub && (

                <section className="hub-info">

                    <div className="hub-info-header">

                        <div>

                            <span className="hub-type">
                                {hub.hubType === 1
                                    ? "공유오피스"
                                    : hub.hubType === 2
                                        ? "숙소"
                                        : "제휴시설"
                                }
                            </span>

                            <h2>{hub.hubName}</h2>

                            <p>
                                {hub.mainRegion} {hub.subRegion}
                            </p>

                        </div>

                        <div className="hub-status">
                            {hub.hubStatus === "OPEN"
                                ? "운영중"
                                : hub.hubStatus
                            }
                        </div>

                    </div>


                    <div className="hub-info-content">

                        <div className="info-item">

                            <span>주소</span>

                            <strong>
                                {hub.hubAddress || "-"}
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>전화번호</span>

                            <strong>
                                {hub.phone || "-"}
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>최대 수용인원</span>

                            <strong>
                                {hub.maxCapacity
                                    ? `${hub.maxCapacity}명`
                                    : "-"
                                }
                            </strong>

                        </div>


                        <div className="info-item">

                            <span>이용요금</span>

                            <strong>
                                {hub.price != null
                                    ? `${hub.price.toLocaleString()}원`
                                    : "-"
                                }
                            </strong>

                        </div>

                    </div>


                    {hub.description && (

                        <div className="hub-description">

                            <span>시설 설명</span>

                            <p>
                                {hub.description}
                            </p>

                        </div>

                    )}

                </section>

            )}


            {/* =========================================
                시설 정보 로딩
            ========================================= */}

            {!hub && hubNo && (

                <div className="loading">
                    시설 정보를 불러오는 중입니다...
                </div>

            )}


            {/* =========================================
                날짜 선택
            ========================================= */}

            <section className="date-section">

                <button
                    onClick={handlePreviousDate}
                    className="date-arrow"
                >
                    ‹
                </button>

                <div className="date-picker">

                    <span>예약 날짜</span>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) =>
                            setSelectedDate(e.target.value)
                        }
                    />

                </div>

                <button
                    onClick={handleNextDate}
                    className="date-arrow"
                >
                    ›
                </button>

            </section>


            {/* =========================================
                예약 현황
            ========================================= */}

            <section className="schedule-section">

                <div className="schedule-title">

                    <div>

                        <h2>예약 현황</h2>

                        <p>
                            원하는 시간을 선택해주세요.
                        </p>

                    </div>


                    <div className="schedule-legend">

                        <span>
                            <i className="available-dot"></i>
                            예약 가능
                        </span>

                        <span>
                            <i className="reserved-dot"></i>
                            예약 완료
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        예약 현황을 불러오는 중입니다...
                    </div>

                ) : (

                    <div className="time-slot-container">

                        {timeSlots.map((slot) => {

                            const reserved =
                                isReserved(slot);

                            const selected =
                                selectedSlot?.start === slot.start;

                            return (

                                <button
                                    key={slot.start}
                                    className={`
                                        time-slot
                                        ${reserved ? "reserved" : "available"}
                                        ${selected ? "selected" : ""}
                                    `}
                                    disabled={reserved}
                                    onClick={() =>
                                        handleSlotClick(slot)
                                    }
                                >

                                    <div className="slot-time">
                                        {slot.start} ~ {slot.end}
                                    </div>

                                    <div className="slot-status">

                                        {reserved
                                            ? "예약 완료"
                                            : selected
                                                ? "선택됨"
                                                : "예약 가능"
                                        }

                                    </div>

                                </button>

                            );

                        })}

                    </div>

                )}

            </section>


            {/* =========================================
                예약 버튼
            ========================================= */}

            <div className="reservation-action">

                {selectedSlot && (

                    <div className="selected-info">

                        <span>선택한 시간</span>

                        <strong>
                            {selectedDate}
                            {" "}
                            {selectedSlot.start}
                            {" ~ "}
                            {selectedSlot.end}
                        </strong>

                    </div>

                )}

                <button
                    className="reservation-button"
                    disabled={!selectedSlot}
                    onClick={handleReservation}
                >
                    예약 신청
                </button>

            </div>

        </div>
    );
}

export default ReservationScheduleComponent;