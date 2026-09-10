import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getReservationDetail,
    cancelReservation,
} from "../api/reservationApi";

import "../styles/ReservationDetail.css";


function ReservationDetailComponent() {

    const { rsvNo } = useParams();

    const navigate = useNavigate();


    const [reservation, setReservation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        fetchReservation();

    }, [rsvNo]);


    const fetchReservation = async () => {

        try {

            const data =
                await getReservationDetail(rsvNo);

            setReservation(data);

        } catch (error) {

            console.error(
                "예약 상세 조회 실패",
                error
            );

            alert(
                "예약 정보를 불러오지 못했습니다."
            );

            navigate("/reservations");

        } finally {

            setLoading(false);

        }

    };


    const handleCancel = async () => {

        const confirmed =
            window.confirm(
                "예약을 취소하시겠습니까?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await cancelReservation(rsvNo);

            alert(
                "예약이 취소되었습니다."
            );

            fetchReservation();

        } catch (error) {

            console.error(
                "예약 취소 실패",
                error
            );

            alert(
                error.response?.data?.message ||
                "예약 취소에 실패했습니다."
            );

        }

    };


    const formatDateTime = (dateTime) => {

        if (!dateTime) {
            return "-";
        }

        return new Date(dateTime)
            .toLocaleString(
                "ko-KR",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

    };


    const getStatus = (status) => {

        switch (status) {

            case "N":
                return {
                    text: "예약",
                    className: "reserved",
                };

            case "C":
                return {
                    text: "취소",
                    className: "cancelled",
                };

            case "Y":
                return {
                    text: "완료",
                    className: "completed",
                };

            default:
                return {
                    text: "-",
                    className: "",
                };
        }

    };


    if (loading) {

        return (
            <div className="reservation-loading">
                예약 정보를 불러오는 중입니다.
            </div>
        );

    }


    if (!reservation) {
        return null;
    }


    const status =
        getStatus(
            reservation.rsvStatus
        );


    const canModify =
        reservation.rsvStatus === "N";


    return (

        <main className="reservation-detail-page">

            <section className="detail-header wf-page-header">

                <div>
                    <h1 className="wf-page-title">예약 상세</h1>
                </div>

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/reservations")
                    }
                >
                    ← 예약 목록
                </button>

            </section>


            <div className="reservation-detail-card">


                {/* 상태 */}

                <div className="detail-status-area">

                    <span
                        className={`detail-status ${status.className}`}
                    >
                        {status.text}
                    </span>

                    <span className="detail-number">
                        예약번호 #{reservation.rsvNo}
                    </span>

                </div>


                {/* 거점 */}

                <section className="detail-section">

                    <h2>
                        이용 거점
                    </h2>

                    <div className="detail-value">

                        <strong>
                            거점 #{reservation.hubNo}
                        </strong>

                    </div>

                </section>


                {/* 기간 */}

                <section className="detail-section">

                    <h2>
                        예약 기간
                    </h2>

                    <div className="detail-period">

                        <strong>
                            {formatDateTime(
                                reservation.rsvStart
                            )}
                        </strong>

                        <span>
                            →
                        </span>

                        <strong>
                            {formatDateTime(
                                reservation.rsvEnd
                            )}
                        </strong>

                    </div>

                </section>


                {/* 인원 */}

                <section className="detail-section">

                    <h2>
                        이용 인원
                    </h2>

                    <p>
                        {reservation.userCapacity}
                        명
                    </p>

                </section>


                {/* 워케이션 */}

                <section className="detail-section">

                    <h2>
                        워케이션
                    </h2>

                    <p>
                        워케이션 #
                        {reservation.workcationNo}
                    </p>

                </section>


                {/* 버튼 */}

                {canModify && (

                    <div className="detail-actions">

                        <button
                            className="update-button"
                            onClick={() =>
                                navigate(
                                    `/reservations/${rsvNo}/update`
                                )
                            }
                        >
                            예약 수정
                        </button>


                        <button
                            className="cancel-button"
                            onClick={handleCancel}
                        >
                            예약 취소
                        </button>

                    </div>

                )}

            </div>

        </main>

    );
}

export default ReservationDetailComponent;
