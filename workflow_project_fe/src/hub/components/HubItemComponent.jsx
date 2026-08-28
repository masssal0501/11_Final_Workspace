// react-router-dom 패키지에서 특정 경로(URL)로 페이지를 이동시키기 위한 useNavigate 훅을 불러옵니다.
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/hubApi";
// 부모 컴포넌트(HubListComponent)로부터 전달받은 데이터(props)를 
// 화면에 하나의 테이블 행(tr) 형태로 렌더링하는 함수형 컴포넌트입니다.
function HubItemComponent(props) {

    // 클릭 이벤트 발생 시 상세 페이지로 라우팅을 처리하기 위해 navigate 함수를 초기화합니다.
    const navigate = useNavigate();

    // 부모 컴포넌트에서 넘겨준 개별 거점 데이터 객체(props.item)를 
    // item이라는 변수에 할당하여 이후 코드에서 짧고 편리하게 사용합니다.
    const item = props.item;
    // 화면에 렌더링할 JSX(HTML 구조)를 반환합니다.
    return(
        // 테이블의 행(tr) 요소입니다. 
        // 행의 아무 곳이나 클릭하면 해당 거점의 고유 식별자(hubNo)를 포함한 
        // 상세 페이지 URL(예: /placeInfo/15)로 즉시 이동(navigate)하도록 onClick 이벤트가 걸려있습니다.
        <tr onClick={ () => { navigate(`/hub/detail/${ item.hubNo }`); } }>
            <td>
                <div className="img-area">
                    <img src={ `${BASE_URL.replace('/hubs', '')}${item.hubFileList[0].filePath}/${item.hubFileList[0].changeName}` } width="300" />
                </div>
                <div className="span-area">
                    <span>주소 : { item.hubAddress }</span>
                    <span>거점 이름 : { item.hubName }</span>
                    <span>전화 번호 : { item.phone }</span>
                    <span>시설 유형 : { (item.hubType == 1) ? "숙소" : "공유오피스" }</span>
                </div>
            </td>
        </tr>
    )
}

// 이 파일 외부(HubListComponent 등)에서 해당 컴포넌트를 import 해서 사용할 수 있도록 내보냅니다.
export default HubItemComponent;