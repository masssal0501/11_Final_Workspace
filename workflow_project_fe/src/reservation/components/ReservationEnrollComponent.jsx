import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAvailableHubs,
    createReservation,
} from "../api/reservationApi";

import "../styles/ReservationEnroll.css";


function ReservationEnrollComponent() {

    const navigate = useNavigate();


    // 지역
    const [mainRegion, setMainRegion] =
        useState("");

    const [subRegion, setSubRegion] =
        useState("");


    // 예약 시간
    const [rsvStart, setRsvStart] =
        useState("");

    const [rsvEnd, setRsvEnd] =
        useState("");


    // 거점
    const [hubs, setHubs] =
        useState([]);

    const [selectedHub, setSelectedHub] =
        useState(null);


    // 이용 인원
    const [userCapacity, setUserCapacity] =
        useState(1);


    const [loading, setLoading] =
        useState(false);


    const workcationNo =
        sessionStorage.getItem("workcationNo");


    const searchHubs = async () => {

        if (!mainRegion || !subRegion) {
            alert("지역을 선택해주세요.");
            return;
        }

        if (!rsvStart || !rsvEnd) {
            alert("예약 시간을 선택해주세요.");
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


        try {

            setLoading(true);

            const data =
                await getAvailableHubs({

                    mainRegion,

                    subRegion,

                    rsvStart,

                    rsvEnd,

                });


            setHubs(data);

            setSelectedHub(null);

        } catch (error) {

            console.error(
                "예약 가능 거점 조회 실패",
                error
            );

            alert(
                "예약 가능한 거점을 조회하지 못했습니다."
            );

        } finally {

            setLoading(false);

        }

    };


    const handleCapacityDecrease = () => {

        setUserCapacity((prev) =>
            Math.max(1, prev - 1)
        );

    };


    const handleCapacityIncrease = () => {

        if (!selectedHub) {
            setUserCapacity(
                (prev) => prev + 1
            );
            return;
        }


        const maxCapacity =
            selectedHub.maxCapacity;


        setUserCapacity((prev) => {

            if (
                maxCapacity &&
                prev >= maxCapacity
            ) {
                return prev;
            }

            return prev + 1;
        });

    };


    const handleReservation = async () => {

        if (!selectedHub) {
            alert("예약할 거점을 선택해주세요.");
            return;
        }


        if (!workcationNo) {
            alert(
                "워케이션 정보를 찾을 수 없습니다."
            );
            return;
        }


        if (
            selectedHub.maxCapacity &&
            userCapacity >
            selectedHub.maxCapacity
        ) {
            alert(
                `최대 ${selectedHub.maxCapacity}명까지 이용 가능합니다.`
            );
            return;
        }


        const reservationData = {

            rsvStart,

            rsvEnd,

            userCapacity,

            workcationNo:
                Number(workcationNo),

            hubNo:
                selectedHub.hubNo,

        };


        try {

            setLoading(true);

            const result =
                await createReservation(
                    reservationData
                );


            alert(
                "예약이 완료되었습니다."
            );


            navigate(
                `/reservations/${result.rsvNo}`
            );

        } catch (error) {

            console.error(
                "예약 신청 실패",
                error
            );

            alert(
                error.response?.data?.message ||
                "예약 신청에 실패했습니다."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <main className="reservation-enroll-page">

            <section className="reservation-page-title wf-page-header">

                <div>
                    <h1 className="wf-page-title">예약 신청</h1>

                    <p className="wf-page-description">
                        이용할 거점과 예약 일정을
                        선택해주세요.
                    </p>
                </div>

            </section>


            {/* 지역 선택 */}

            <section className="reservation-section">

                <h2>
                    01. 이용 지역
                </h2>


                <div className="region-inputs">

                    <select
                        value={mainRegion}
                        onChange={(e) =>
                            setMainRegion(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            광역지역 선택
                        </option>

                        <option value="강원도">
                            강원도
                        </option>

                        <option value="제주도">
                            제주도
                        </option>

                        <option value="부산">
                            부산
                        </option>

                    </select>


                    <select
                        value={subRegion}
                        onChange={(e) =>
                            setSubRegion(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            세부지역 선택
                        </option>

                        {mainRegion === "강원도" && (
                            <>
                                <option value="강릉시">
                                    강릉시
                                </option>

                                <option value="속초시">
                                    속초시
                                </option>

                                <option value="양양군">
                                    양양군
                                </option>
                            </>
                        )}

                        {mainRegion === "제주도" && (
                            <>
                                <option value="제주시">
                                    제주시
                                </option>

                                <option value="서귀포시">
                                    서귀포시
                                </option>
                            </>
                        )}

                        {mainRegion === "부산" && (
                            <option value="해운대구">
                                해운대구
                            </option>
                        )}

                    </select>

                </div>

            </section>


            {/* 예약 시간 */}

            <section className="reservation-section">

                <h2>
                    02. 이용 일시
                </h2>


                <div className="datetime-inputs">

                    <div>

                        <label>
                            시작
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


                    <span>
                        →
                    </span>


                    <div>

                        <label>
                            종료
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

                </div>


                <button
                    className="search-hub-button"
                    onClick={searchHubs}
                    disabled={loading}
                >
                    {loading
                        ? "조회 중..."
                        : "예약 가능한 거점 조회"}
                </button>

            </section>


            {/* 거점 선택 */}

            <section className="reservation-section">

                <h2>
                    03. 거점 선택
                </h2>


                {hubs.length === 0 ? (

                    <div className="hub-empty">
                        예약 가능한 거점을 조회해주세요.
                    </div>

                ) : (

                    <div className="hub-list">

                        {hubs.map((hub) => (

                            <div
                                key={hub.hubNo}
                                className={
                                    selectedHub?.hubNo ===
                                    hub.hubNo
                                        ? "hub-card selected"
                                        : "hub-card"
                                }
                                onClick={() =>
                                    setSelectedHub(
                                        hub
                                    )
                                }
                            >

                                <div className="hub-radio">

                                    <input
                                        type="radio"
                                        checked={
                                            selectedHub?.hubNo ===
                                            hub.hubNo
                                        }
                                        onChange={() =>
                                            setSelectedHub(
                                                hub
                                            )
                                        }
                                    />

                                </div>


                                <div className="hub-info">

                                    <h3>
                                        {hub.hubName}
                                    </h3>

                                    <p>
                                        {hub.hubAddress}
                                    </p>

                                    <span>
                                        최대{" "}
                                        {hub.maxCapacity ??
                                            "-"}
                                        명
                                    </span>

                                </div>


                                <div className="hub-price">

                                    {hub.price
                                        ? `${hub.price.toLocaleString()}원`
                                        : "가격 문의"}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* 이용 인원 */}

            <section className="reservation-section">

                <h2>
                    04. 이용 인원
                </h2>


                <div className="capacity-control">

                    <button
                        onClick={
                            handleCapacityDecrease
                        }
                    >
                        −
                    </button>

                    <strong>
                        {userCapacity}명
                    </strong>

                    <button
                        onClick={
                            handleCapacityIncrease
                        }
                    >
                        +
                    </button>

                </div>

            </section>


            {/* 신청 */}

            <div className="reservation-submit-area">

                <button
                    className="reservation-submit-button"
                    onClick={handleReservation}
                    disabled={
                        loading ||
                        !selectedHub
                    }
                >
                    {loading
                        ? "예약 처리 중..."
                        : "예약 신청"}
                </button>

            </div>

        </main>

    );
}

export default ReservationEnrollComponent;
