import { useNavigate } from "react-router-dom";

function PlaceItem(props) {

    const navigate = useNavigate();

    const item = props.item;

    // 장소 유형
    const getHubTypeName = (hubType) => {

        switch (Number(hubType)) {
            case 1:
                return "공유오피스";
            case 2:
                return "숙소";
            case 3:
                return "체험 프로그램";
            case 4:
                return "맛집";
            case 5:
                return "관광지";
            default:
                return "기타";
        }

    };


    // 운영 상태
    const getStatusName = (status) => {

        switch (status) {
            case "OPEN":
                return "운영중";
            case "PAUSED":
                return "일시중단";
            case "CLOSED":
                return "종료";
            default:
                return status;
        }

    };


    return (

        <div
            className="place-item"
            onClick={() => {
                navigate(`/place/detail/${item.hubNo}`);
            }}
        >

            {/* 상단 */}
            <div className="place-item-header">

                <span className="place-type">
                    {getHubTypeName(item.hubType)}
                </span>

                <span className={`place-status ${item.hubStatus?.toLowerCase()}`}>
                    {getStatusName(item.hubStatus)}
                </span>

            </div>


            {/* 내용 */}
            <div className="place-item-content">

                <h3>
                    {item.hubName}
                </h3>

                <div className="place-info">

                    <p>
                        <span className="info-label">지역</span>
                        {item.mainRegion} {item.subRegion}
                    </p>

                    <p>
                        <span className="info-label">주소</span>
                        {item.hubAddress || "주소 정보가 없습니다."}
                    </p>

                    <p>
                        <span className="info-label">전화</span>
                        {item.phone || "전화번호 정보가 없습니다."}
                    </p>

                </div>


                <p className="place-description">
                    {item.description || "등록된 설명이 없습니다."}
                </p>

            </div>


            {/* 상세보기 */}
            <div className="place-item-footer">
                <span>자세히 보기</span>
                <span className="arrow">→</span>
            </div>

        </div>

    );

}

export default PlaceItem;