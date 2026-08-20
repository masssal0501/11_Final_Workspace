import { useNavigate } from "react-router-dom";

function WorkcationProgramItem(props) {

    const navigate = useNavigate();

    const item = props.item;

    return (
        <div
            onClick={() => {
                navigate(`/workcation/program/detail/${item.hubNo}`);
            }}
        >
            <div>{item.hubNo}</div>
            <div>{item.hubName}</div>
            <div>{item.hubAddress}</div>
            <div>{item.phone}</div>
            <div>{item.description}</div>
        </div>
    );
}

export default WorkcationProgramItem;