import { useNavigate } from "react-router-dom";

function PlaceItem(props) {

    const navigate = useNavigate();

    const item = props.item;

    return (
        <div
            onClick={() => {
                navigate(`/place/detail/${item.hubNo}`);
            }}
        >
            <div>{item.hubNo}</div>
            <div>{item.hubName}</div>
            <div>{item.hubAddress}</div>
            <div>{item.phone}</div>
            <div>{item.description}</div>
            <div>{item.hubStatus}</div>

        </div>
    );
}

export default PlaceItem;