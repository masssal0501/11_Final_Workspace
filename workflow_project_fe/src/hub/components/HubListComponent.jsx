import "../styles/Hub.css"

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { selectHubListApi, searchHubListApi } from "../api/hubApi";

import HubItemComponent from "./HubItemComponent";

function HubListComponent(props) {

    // 페이지 이동(라우팅)을 처리하기 위한 훅. 다른 페이지로 넘어갈 때 사용합니다.
    const navigate = useNavigate();

    // URL의 쿼리 스트링(예: ?cpage=1&regionName=강원)을 읽고 쓰기 위한 훅입니다.
    const [searchParams, setSearchParams] = useSearchParams();

    // 로그인한 사용자 정보 불러오기
    const loginUser = props.loginUser;
    
    // 값이 없을 경우를 대비해 || 연산자로 기본값을 설정합니다. (페이지 기본값 1, 나머지는 빈 문자열)
    const cpage = parseInt(searchParams.get("cpage")) || 1;
    const mainRegion = searchParams.get("mainRegion") || "";
    const subRegion = searchParams.get("subRegion") || "";
    const hubType = searchParams.get("hubType") || "";
    const keyword =searchParams.get("keyword") || "";
    
    // 검색창 폼의 입력 상태를 관리하는 State입니다. URL 파라미터 값을 초기값으로 사용합니다.
    const [inputData, setInputData] = useState({mainRegion, hubType, keyword});

    // 서버로부터 받아온 거점 목록(<tr> 배열 또는 컴포넌트 배열)을 렌더링하기 위해 저장하는 State입니다.
    const [dataList, setDataList] = useState([]);

    // 하단 페이징 처리 버튼(이전, 번호, 다음) 요소들을 배열 형태로 저장하는 State입니다.
    const [pageList, setPageList] = useState([]);

    // URL 파라미터(regionName, hubType, keyword)가 변경될 때마다 
    // 검색 폼의 입력값(inputData State)을 동기화해주는 역할을 합니다.
    useEffect(() => {

        setInputData({ mainRegion, subRegion, hubType, keyword });

    }, [mainRegion, subRegion, hubType, keyword]);

    // 페이지 번호나 검색 조건이 바뀔 때마다 서버에 데이터를 새로 요청하는 Effect입니다.
    useEffect(() => {

        // 검색 조건이 하나도 없을 때는 전체 목록 조회를, 
        // 하나라도 있을 때는 검색 조건에 맞는 목록 조회를 실행합니다.
        if(!mainRegion && !subRegion && !hubType && !keyword) {

            selectHubList();

        } else {

            searchHubList();
        }
    // 의존성 배열에 파라미터들을 넣어, 이 값들이 URL에서 바뀔 때마다 Effect가 재실행되도록 합니다.
    }, [cpage, mainRegion, subRegion, hubType, keyword]);

    const handleRegion = () => {
        if(inputData.mainRegion === "강원") {
            return (
                <select className="custom-select" value={ inputData.subRegion } onChange={ handleChange } name="subRegion">
                    <option value="">전체</option>
                    <option value="강릉시">강릉시</option>
                    <option value="고성군">고성군</option>
                    <option value="동해시">동해시</option>
                    <option value="삼척시">삼척시</option>
                    <option value="속초시">속초시</option>
                    <option value="양구군">양구군</option>
                    <option value="양양군">양양군</option>
                    <option value="원주시">원주시</option>
                    <option value="영월군">영월군</option>
                    <option value="인제군">인제군</option>
                    <option value="정선군">정선군</option>
                    <option value="철원군">철원군</option>
                    <option value="춘천시">춘천시</option>
                    <option value="태백시">태백시</option>
                    <option value="평창군">평창군</option>
                    <option value="화천군">화천군</option>
                    <option value="홍천군">홍천군</option>
                    <option value="횡성군">횡성군</option>
                </select>
            )
        } else if(inputData.mainRegion === "제주") {
            return (
                <select className="custom-select" value={ inputData.subRegion } onChange={ handleChange } name="subRegion">
                    <option value="">전체</option>
                    <option value="서귀포시">서귀포시</option>
                    <option value="제주시">제주시</option>
                </select>
            )
        } else if(inputData.mainRegion === "부산") {
            return (
                <select className="custom-select" value={ inputData.subRegion } onChange={ handleChange } name="subRegion">
                    <option value="">전체</option>
                    <option value="강서구">강서구</option>
                    <option value="금정구">금정구</option>
                    <option value="기장군">기장군</option>
                    <option value="남구">남구</option>
                    <option value="동구">동구</option>
                    <option value="동래시">동래시</option>
                    <option value="부산진구">부산진구</option>
                    <option value="사상구">사상구</option>
                    <option value="사하구">사하구</option>
                    <option value="서구">서구</option>
                    <option value="수영구">수영구</option>
                    <option value="연제구">연제구</option>
                    <option value="영도구">영도구</option>
                    <option value="해운대구">해운대구</option>
                </select>
            )
        } else {
            return (
                <select className="custom-select" value={ inputData.subRegion } onChange={ handleChange } name="subRegion">
                    <option value="">전체</option>
                </select>
            )
        }
    }

    // 전체 거점 목록을 조회하는 비동기 함수입니다.
    const selectHubList = async () => {

        try {

            // API를 호출하여 현재 페이지(cpage)에 해당하는 전체 리스트를 가져옵니다.
            const response = await selectHubListApi(cpage);

            // 성공적으로 데이터를 받아오면 화면 렌더링을 위해 handleResponse 함수로 넘깁니다.
            handleResponse(response);

        } catch(error) {

            console.error(error);
        }
    };

    // 검색 조건이 포함된 거점 목록을 조회하는 비동기 함수입니다.
    const searchHubList = async () => {

        try {

            // API를 호출할 때 현재 페이지와 함께 검색 조건 객체({mainRegion, subRegion, hubType, keyword})를 전달합니다.
            const response = await searchHubListApi(cpage, { mainRegion, subRegion, hubType, keyword });

            // 데이터를 성공적으로 받아오면 handleResponse를 통해 화면을 업데이트합니다.
            handleResponse(response);

        } catch(error) {

            console.error(error);
        }
    };

    // 사용자가 검색 폼(select, input)의 값을 변경할 때 호출되는 핸들러입니다.
    const handleChange = e => {
        
        // 기존 inputData를 복사한 뒤, 이벤트를 발생시킨 태그의 name 속성을 Key로 하여 값을 업데이트합니다.
        setInputData({...inputData, [e.target.name]: e.target.value});

    };

    // 돋보기(검색) 버튼을 클릭했을 때 호출되는 핸들러입니다.
    const handleClick = e => {

        // form 제출 등으로 인한 브라우저 기본 새로고침을 방지합니다.
        e.preventDefault();

        // 검색 실행 시 페이지를 1페이지로 초기화하고, 입력된 조건들로 URL 파라미터를 변경합니다.
        // URL이 변경되면 윗부분의 useEffect가 이를 감지하고 API를 재호출합니다.
        setSearchParams({
            cpage : 1,
            mainRegion : inputData.mainRegion,
            subRegion : inputData.subRegion,
            hubType : inputData.hubType,
            keyword : inputData.keyword
        });
    };

    // API 통신 결과를 받아와서 목록 데이터와 페이징 버튼을 생성하는 핵심 함수입니다.
    const handleResponse = response => {

        // 서버에서 넘겨준 페이징 정보(총 페이지, 시작/끝 페이지 등)와 실제 아이템 리스트를 변수에 담습니다.
        const pageInfo = response.data.pi;
        const items = response.data.list;

        // 관리자가 아니면서 CLOSED 상태인 아이템을 filter로 사전 제외합니다.
        const filteredItems = items.filter(item => loginUser.authCode === "ADMIN" || item.hubStatus !== "CLOSED");

        // 필터링된 배열로 HubItemComponent 요소 생성
        const trArr = filteredItems.map((item, index) => (
            <HubItemComponent key={index} item={item} />
        ));;

        // 만들어진 컴포넌트 배열을 dataList State에 저장하여 화면에 렌더링되게 합니다.
        setDataList(trArr);
        
        // 페이징 버튼들을 담을 빈 배열을 생성합니다.
        const btnArr = []

        // 특정 페이지 번호를 클릭했을 때 URL 파라미터를 해당 페이지 번호로 업데이트하는 내부 함수입니다.
        const changePage = (p) => {
            const params = { cpage: p };

            // 기존 검색 조건이 유지되도록 파라미터 객체에 추가해줍니다.
            if (mainRegion) params.mainRegion = mainRegion;
            if (subRegion) params.subRegion = subRegion;
            if (hubType) params.hubType = hubType;
            if (keyword) params.keyword = keyword;

            // 최종 파라미터로 URL을 갱신합니다.
            setSearchParams(params);
        };

        // 데이터가 1개라도 있을 때만 페이징 버튼을 생성합니다.
        if (pageInfo.listCount > 0 && filteredItems.length > 0) {
            
            // [<] 이전 페이지 버튼: 현재 페이지가 1보다 클 때만 배열에 추가 (1페이지면 아예 안 보임)
            btnArr.push(
                <button key="prev" className="btn btn-outline-info btn-sm" style={{ border: "1px solid currentColor" }} disabled={cpage === 1} onClick={() => changePage(cpage - 1)}>
                    &lt;
                </button>
            );

            // 숫자 페이지 버튼들 생성 (startPage부터 endPage까지 반복)
            for(let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {
                btnArr.push(
                    <button key={ p } className={`btn btn-${cpage === p ? 'info' : 'outline-info'} btn-sm`} onClick={() => changePage(p)}>
                        { p }
                    </button>
                );
            }

            // 검색 결과가 없어서 maxPage가 0으로 내려올 경우를 대비해 최소 1페이지로 보정
            const safeMaxPage = pageInfo.maxPage === 0 ? 1 : pageInfo.maxPage;

            // [>] 다음 페이지 버튼: 현재 페이지가 마지막 페이지보다 작을 때만 배열에 추가 (마지막 페이지면 아예 안 보임)
            btnArr.push(
            <button key="next" className="btn btn-outline-info btn-sm" style={{ border: "1px solid currentColor" }} disabled={cpage === safeMaxPage} onClick={() => changePage(cpage + 1)}>
                &gt;
            </button>
        );
        }

        // 완성된 페이징 버튼 배열을 State에 저장하여 화면 하단에 렌더링되게 합니다.
        setPageList(btnArr);
    };

    // return 구문
    return (
        <div className="content">
            <div className="position-relative d-flex align-items-center w-100 mb-4 hub-list-header">
                <h2 className="m-0 w-100 text-center"><b>거점 목록</b></h2>
                <button className="btn btn-outline-dark" onClick={ () => { navigate("/place/list") } }>지역 정보 목록으로</button>
            </div>
            <br />
            {/* 상단 검색 필터 테이블 영역 */}
            <table align="left" className="search-filter-table hub-table">
                <tbody>
                    <tr style={ { border : "none" } }>
                        <td>지역 : </td>
                        <td>
                            <select className="custom-select" value={ inputData.mainRegion } onChange={ handleChange } name="mainRegion">
                                <option value="">전체</option>
                                <option value="강원">강원</option>
                                <option value="제주">제주</option>
                                <option value="부산">부산</option>
                            </select>
                        </td>
                        <td style={ { float : "left", marginBottom : "10px" } }>
                            { handleRegion() }
                        </td>
                    </tr>
                    <tr style={ { border : "none" } }>
                        <td>상태 : </td>
                        <td>
                            <select className="custom-select" value={ inputData.hubType } onChange={ handleChange } name="hubType">
                                <option value="">전체</option>
                                <option value="1">숙소</option>
                                <option value="2">공유오피스</option>
                            </select>
                        </td>
                        <td>
                            <div className="input-group">
                                <input type="search" className="form-control" placeholder="거점 이름을 입력해주세요." name="keyword" onChange={ handleChange } value={ inputData.keyword } />
                                <button type="submit" className="btn btn-outline-secondary" onClick={ handleClick }>🔍</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            {/* 우측 상단 AI 추천 페이지로 이동하는 버튼 영역 */}
            <div align="right">
                <button type="button" id="AI" onClick={ () => { navigate("/hub/ai"); } }>AI에게 장소 및 일정 추천 받기</button>
            </div>
            
            <div style={{ height: "30px" }}></div>

            {/* 거점 목록이 나열되는 메인 테이블 영역 */}
            <table className="table table-hover list-area hub-table">
                <thead></thead>
                <tbody> 
                    {/* 서버로부터 받아와서 생성한 실제 아이템 컴포넌트들(HubItemComponent)이 이 자리에 뿌려집니다. */}
                    { dataList.length > 0 ? (dataList) : (
                        <tr className="not-found">
                            <td>
                                <h3><b><mark>조회된 거점이 존재하지 않습니다.</mark></b></h3>
                            </td>
                        </tr>
                    ) }
                </tbody>
            </table>

            <br />

            {/* 페이징 버튼들이 들어가는 영역 */}
            <div align="center" className="paging-area">{ pageList }</div>

            <br />
            
            {/* 거점 등록 폼 페이지로 이동하는 하단 버튼 영역 */}
            
            { (loginUser.authCode === "ADMIN") && (
                <div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={ () => { navigate("/hub/enrollForm") } }>▶ 거점 등록</button>
                </div>
            )}
            <br /><br />

        </div>
    )
}

export default HubListComponent;