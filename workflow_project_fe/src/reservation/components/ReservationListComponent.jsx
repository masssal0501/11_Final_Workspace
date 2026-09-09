import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getReservationsByWorkcation,
} from "../api/reservationApi";

import ReservationItemComponent from "./ReservationItemComponent";

import "../styles/ReservationList.css";


function ReservationListComponent() {

    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);


    /*
     * 실제 프로젝트에서는 로그인한 사용자의
     * 워케이션 번호를 Zustand / Context 등에서 가져오면 됨.
     */
    const workcationNo =
        sessionStorage.getItem("workcationNo");


    useEffect(() => {

        if (!workcationNo) {
            setLoading(false);
            return;
        }

        fetchReservations();

    }, [workcationNo]);


    const fetchReservations = async () => {

        try {

            setLoading(true);

            const data =
                await getReservationsByWorkcation(
                    workcationNo
                );

            setReservations(data);

        } catch (error) {

            console.error(
                "예약 목록 조회 실패",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    const filteredReservations =
        reservations.filter((reservation) => {

            if (statusFilter === "ALL") {
                return true;
            }

            return (
                reservation.rsvStatus === statusFilter
            );
        });


    const handleCreate = () => {
        navigate("/reservations/enroll");
    };


    const handleDetail = (rsvNo) => {
        navigate(`/reservations/${rsvNo}`);
    };


    return (

        <main className="reservation-page">

            <section className="reservation-header wf-page-header">

                <div>
                    <h1 className="wf-page-title">예약 관리</h1>

                    <p className="wf-page-description">
                        워케이션 시설 예약 내역을
                        확인할 수 있습니다.
                    </p>
                </div>

                <button
                    className="reservation-create-button"
                    onClick={handleCreate}
                >
                    + 예약 신청
                </button>

            </section>


            <div className="reservation-filter">

                <button
                    className={
                        statusFilter === "ALL"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setStatusFilter("ALL")
                    }
                >
                    전체
                </button>

                <button
                    className={
                        statusFilter === "N"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setStatusFilter("N")
                    }
                >
                    예약
                </button>

                <button
                    className={
                        statusFilter === "C"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setStatusFilter("C")
                    }
                >
                    취소
                </button>

                <button
                    className={
                        statusFilter === "Y"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setStatusFilter("Y")
                    }
                >
                    완료
                </button>

            </div>


            <div className="reservation-count">

                총{" "}
                <strong>
                    {filteredReservations.length}
                </strong>
                건

            </div>


            {loading ? (

                <div className="reservation-empty">
                    예약 정보를 불러오는 중입니다.
                </div>

            ) : filteredReservations.length === 0 ? (

                <div className="reservation-empty">

                    <div className="empty-icon">
                        📅
                    </div>

                    <h3>
                        예약 내역이 없습니다.
                    </h3>

                    <p>
                        워케이션 시설을 예약해보세요.
                    </p>

                    <button
                        onClick={handleCreate}
                    >
                        예약 신청하기
                    </button>

                </div>

            ) : (

                <div className="reservation-list">

                    {filteredReservations.map(
                        (reservation) => (

                            <ReservationItemComponent
                                key={reservation.rsvNo}
                                reservation={reservation}
                                onClick={handleDetail}
                            />

                        )
                    )}

                </div>

            )}

        </main>

    );
}

export default ReservationListComponent;
