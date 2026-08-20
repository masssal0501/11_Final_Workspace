// react-router-dom 패키지에서 특정 경로(URL)로 페이지를 이동시키기 위한 useNavigate 훅을 불러옵니다.
import { useNavigate } from "react-router-dom";

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
        <tr onClick={ () => { navigate(`/placeInfo/${ item.hubNo }`); } }>
            <td>
                {/* 
                    거점의 대표 이미지를 출력합니다. 
                    - src: 서버에 저장된 폴더 경로(filePath)와 실제 저장된 파일명(changeName)을 합쳐서 이미지 주소로 사용합니다.
                    - alt: 이미지를 불러오지 못했을 때 대신 보여줄 텍스트(거점 이름)입니다.
                    - width: 이미지의 가로 길이를 300px로 고정합니다.
                */}
                <img src={ item.filePath + item.changeName } alt={ item.hubName } width="300" />
                <p>
                    {/* 데이터베이스나 API에서 넘겨받은 실제 데이터를 문자열과 조합하여 출력하고, <br /> 태그로 줄바꿈합니다. */}
                    주소 : { item.hubAddress }<br />
                    거점 이름 : { item.hubName }<br />
                    전화 번호 : { item.phone }<br />
                    
                    {/* 
                        삼항 연산자를 사용한 조건부 렌더링 부분입니다. 
                        서버에서 넘어온 시설 유형 값(item.hubType)이 숫자 1과 같다면 "숙소"를 렌더링하고,
                        그렇지 않다면 "공유오피스"를 렌더링합니다.
                    */}
                    시설 유형 : { (item.hubType == 1) ? "숙소" : "공유오피스" }
                </p>
            </td>
        </tr>
    )
}

// 이 파일 외부(HubListComponent 등)에서 해당 컴포넌트를 import 해서 사용할 수 있도록 내보냅니다.
export default HubItemComponent;