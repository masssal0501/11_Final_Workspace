import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/hubApi";

// 개별 거점 항목을 테이블 행(tr) 형태로 렌더링하는 컴포넌트
function HubItemComponent(props) {

    const navigate = useNavigate();
    const item = props.item;
    
    return(
        // 행 클릭 시 해당 거점의 상세 페이지로 이동
        <tr onClick={ () => { navigate(`/hub/detail/${ item.hubNo }`); } }>
            <td>
                <div className="img-area">
                    {/* 첨부 이미지가 없는 거점도 있으므로 안전하게 접근한다 (없으면 렌더링 생략) */}
                    { item.hubFileList && item.hubFileList.length > 0 && (
                        <img src={ `${BASE_URL.replace('/hubs', '')}${item.hubFileList[0].filePath}/${item.hubFileList[0].changeName}` } width="300" />
                    ) }
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