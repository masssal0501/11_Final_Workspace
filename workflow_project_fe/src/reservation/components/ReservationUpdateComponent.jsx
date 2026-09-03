import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getReservationDetail,
    updateReservation,
} from "../api/reservationApi";

import "../styles/ReservationUpdate.css";


function ReservationUpdateComponent() {

    const { rsvNo } = useParams();

    const navigate = useNavigate();


    const [rsvStart, setRsvStart] =
        useState("");

    const [rsvEnd, setRsvEnd] =
        useState("");

    const [userCapacity, setUserCapacity] =
        useState(1);


    const [hubNo, setHubNo] =
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


            if (data.rsvStatus !== "N") {

                alert(
                    "현재 상태에서는 예약을 수정할 수 없습니다."
                );

                navigate(
                    `/reservations/${rsvNo}`
                );

                return;
            }


            setRsvStart(
                convertToDateTimeLocal(
                    data.rsvStart
                )
            );

            setRsvEnd(
                convertToDateTimeLocal(
                    data.rsvEnd
                )
            );

            setUserCapacity(
                data.userCapacity ?? 1
            );

            setHubNo(data.hubNo);

        } catch (error) {

            console.error(
                "예약 정보 조회 실패",
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


    const convertToDateTimeLocal = (
        dateTime
    ) => {

        if (!dateTime) {
            return "";
        }

        return dateTime.substring(
            0,
            16
        );

    };


    const handleSubmit = async () => {

        if (!rsvStart || !rsvEnd) {

            alert(
                "예약 시간을 입력해주세요."
            );

            return;
        }


        if (
            new Date(rsvStart) >=
            new Date(rsvEnd)
        ) {

            alert(
                "종료 시간은 시작 시간보다 이후여야 합니다."
            );

            return;
        }


        const updateData = {

            rsvStart,

            rsvEnd,

            userCapacity,

        };


        try {

            setLoading(true);


            await updateReservation(
                rsvNo,
                updateData
            );


            alert(
                "예약이 수정되었습니다."
            );


            navigate(
                `/reservations/${rsvNo}`
            );

        } catch (error) {

            console.error(
                "예약 수정 실패",
                error
            );

            alert(
                error.response?.data?.message ||
                "예약 수정에 실패했습니다."
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (
            <div className="reservation-loading">
                불러오는 중입니다.
            </div>
        );

    }


    return (

        <div className="reservation-update-page">

            <div className="reservation-page-title">

                <button
                    onClick={() =>
                        navigate(
                            `/reservations/${rsvNo}`
                        )
                    }
                >
                    ← 돌아가기
                </button>

                <h1>
                    예약 수정
                </h1>

                <p>
                    예약 정보를 수정할 수 있습니다.
                </p>

            </div>


            <div className="reservation-form-card">


                {/* 거점 */}

                <div className="form-group">

                    <label>
                        이용 거점
                    </label>

                    <div className="readonly-value">

                        거점 #{hubNo}

                    </div>

                    <small>
                        예약 수정 시 거점은
                        변경할 수 없습니다.
                    </small>

                </div>


                {/* 시작 */}

                <div className="form-group">

                    <label>
                        예약 시작
                    </label>

                    <input
                        type="datetime-local"
                        value={rsvStart}
                        onChange={(e) =>
                            setRsvStart(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* 종료 */}

                <div className="form-group">

                    <label>
                        예약 종료
                    </label>

                    <input
                        type="datetime-local"
                        value={rsvEnd}
                        onChange={(e) =>
                            setRsvEnd(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* 인원 */}

                <div className="form-group">

                    <label>
                        이용 인원
                    </label>

                    <div className="capacity-control">

                        <button
                            onClick={() =>
                                setUserCapacity(
                                    (prev) =>
                                        Math.max(
                                            1,
                                            prev - 1
                                        )
                                )
                            }
                        >
                            −
                        </button>

                        <strong>
                            {userCapacity}명
                        </strong>

                        <button
                            onClick={() =>
                                setUserCapacity(
                                    (prev) =>
                                        prev + 1
                                )
                            }
                        >
                            +
                        </button>

                    </div>

                </div>


                {/* 버튼 */}

                <div className="form-actions">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                `/reservations/${rsvNo}`
                            )
                        }
                    >
                        취소
                    </button>

                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? "수정 중..."
                            : "수정 완료"}
                    </button>

                </div>

            </div>

        </div>

    );
}

export default ReservationUpdateComponent;
