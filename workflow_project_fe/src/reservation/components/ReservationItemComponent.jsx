function ReservationItemComponent({
    reservation,
    onClick,
}) {

    const {
        rsvNo,
        rsvStart,
        rsvEnd,
        rsvStatus,
        userCapacity,
        hubNo,
    } = reservation;


    const statusMap = {

        N: {
            text: "예약",
            className: "reserved",
        },

        C: {
            text: "취소",
            className: "cancelled",
        },

        Y: {
            text: "완료",
            className: "completed",
        },

    };


    const status =
        statusMap[rsvStatus] ?? {
            text: "알 수 없음",
            className: "",
        };


    const formatDateTime = (dateTime) => {

        if (!dateTime) {
            return "-";
        }

        const date =
            new Date(dateTime);

        return date.toLocaleString(
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


    return (

        <div
            className="reservation-item"
            onClick={() => onClick(rsvNo)}
        >

            <div className="reservation-item-main">

                <div className="reservation-item-top">

                    <span className="reservation-number">
                        예약번호 #{rsvNo}
                    </span>

                    <span
                        className={`reservation-status ${status.className}`}
                    >
                        {status.text}
                    </span>

                </div>


                <h3>
                    거점 #{hubNo}
                </h3>


                <div className="reservation-period">

                    <span>
                        {formatDateTime(rsvStart)}
                    </span>

                    <span className="period-arrow">
                        →
                    </span>

                    <span>
                        {formatDateTime(rsvEnd)}
                    </span>

                </div>


                <div className="reservation-capacity">

                    이용 인원{" "}
                    <strong>
                        {userCapacity ?? 0}명
                    </strong>

                </div>

            </div>


            <div className="reservation-item-arrow">
                ›
            </div>

        </div>

    );
}

export default ReservationItemComponent;
