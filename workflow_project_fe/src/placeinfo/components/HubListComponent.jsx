import "../styles/HubListComponent.css"

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { selectHubListApi, searchHubListApi } from "../api/placeinfoApi";

import HubItemComponent from "./HubItemComponent";

function HubListComponent() {

    // 페이지 이동(라우팅)을 처리하기 위한 훅. 다른 페이지로 넘어갈 때 사용합니다.
    const navigate = useNavigate();

    // URL의 쿼리 스트링(예: ?cpage=1&regionName=강원)을 읽고 쓰기 위한 훅입니다.
    const [searchParams, setSearchParams] = useSearchParams();

    // URL 파라미터에서 값을 추출하여 변수에 저장합니다.
    // 값이 없을 경우를 대비해 || 연산자로 기본값을 설정합니다. (페이지 기본값 1, 나머지는 빈 문자열)
    const cpage = parseInt(searchParams.get("cpage")) || 1;
    const regionName = searchParams.get("regionName") || "";
    const hubType = searchParams.get("hubType") || "";
    const keyword =searchParams.get("keyword") || "";
    
    // 검색창 폼의 입력 상태를 관리하는 State입니다. URL 파라미터 값을 초기값으로 사용합니다.
    const [inputData, setInputData] = useState({regionName, hubType, keyword});

    // 서버로부터 받아온 거점 목록(<tr> 배열 또는 컴포넌트 배열)을 렌더링하기 위해 저장하는 State입니다.
    const [dataList, setDataList] = useState([]);

    // 하단 페이징 처리 버튼(이전, 번호, 다음) 요소들을 배열 형태로 저장하는 State입니다.
    const [pageList, setPageList] = useState([]);

    // URL 파라미터(regionName, hubType, keyword)가 변경될 때마다 
    // 검색 폼의 입력값(inputData State)을 동기화해주는 역할을 합니다.
    useEffect(() => {

        setInputData({ regionName, hubType, keyword });

    }, [regionName, hubType, keyword]);

    // 페이지 번호나 검색 조건이 바뀔 때마다 서버에 데이터를 새로 요청하는 Effect입니다.
    useEffect(() => {

        // 검색 조건이 하나도 없을 때는 전체 목록 조회를, 
        // 하나라도 있을 때는 검색 조건에 맞는 목록 조회를 실행합니다.
        if(!regionName && !hubType && !keyword) {

            selectHubList();

        } else {

            searchHubList();
        }
    // 의존성 배열에 파라미터들을 넣어, 이 값들이 URL에서 바뀔 때마다 Effect가 재실행되도록 합니다.
    }, [cpage, regionName, hubType, keyword]);

    // 전체 거점 목록을 조회하는 비동기 함수입니다.
    const selectHubList = async () => {

        try {

            // API를 호출하여 현재 페이지(cpage)에 해당하는 전체 리스트를 가져옵니다.
            const response = await selectHubListApi(cpage);

            // 성공적으로 데이터를 받아오면 화면 렌더링을 위해 handleResponse 함수로 넘깁니다.
            handleResponse(response);

        } catch(error) {

            console.log("거점 목록 조회용 ajax 통신 실패!");
        }
    };

    // 검색 조건이 포함된 거점 목록을 조회하는 비동기 함수입니다.
    const searchHubList = async () => {

        try {

            // API를 호출할 때 현재 페이지와 함께 검색 조건 객체({regionName, hubType, keyword})를 전달합니다.
            const response = await searchHubListApi(cpage, { regionName, hubType, keyword });

            // 데이터를 성공적으로 받아오면 handleResponse를 통해 화면을 업데이트합니다.
            handleResponse(response);

        } catch(error) {

            console.log("거점 검색용 ajax 통신 실패!");
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
            regionName : inputData.regionName,
            hubType : inputData.hubType,
            keyword : inputData.keyword
        });
    };

    // API 통신 결과를 받아와서 목록 데이터와 페이징 버튼을 생성하는 핵심 함수입니다.
    const handleResponse = response => {

        // 서버에서 넘겨준 페이징 정보(총 페이지, 시작/끝 페이지 등)와 실제 아이템 리스트를 변수에 담습니다.
        const pageInfo = response.data.pi;
        const items = response.data.list;

        // 아이템 배열을 순회하며 HubItemComponent로 변환하여 배열(trArr)로 만듭니다.
        const trArr = items.map((item, index) => {
            return(
                <HubItemComponent key={ index } item={ item } />
            )
        });

        // 만들어진 컴포넌트 배열을 dataList State에 저장하여 화면에 렌더링되게 합니다.
        setDataList(trArr);
        
        // 페이징 버튼들을 담을 빈 배열을 생성합니다.
        const btnArr = []

        // 특정 페이지 번호를 클릭했을 때 URL 파라미터를 해당 페이지 번호로 업데이트하는 내부 함수입니다.
        const changePage = (p) => {
            const params = { cpage: p };

            // 기존 검색 조건이 유지되도록 파라미터 객체에 추가해줍니다.
            if (regionName) params.regionName = regionName;
            if (hubType) params.hubType = hubType;
            if (keyword) params.keyword = keyword;

            // 최종 파라미터로 URL을 갱신합니다.
            setSearchParams(params);
        };

        // 검색 결과가 없어서 maxPage가 0으로 내려올 경우를 대비해 최소 1페이지로 보정해줍니다.
        const safeMaxPage = pageInfo.maxPage === 0 ? 1 : pageInfo.maxPage;

        // 1. [<] 이전 페이지 버튼 생성
        // 현재 페이지가 1이면 disabled(비활성화) 처리하고 색상을 info로 둡니다.
        btnArr.push(
            <button key="prev" className={`btn btn-${cpage === 1 ? 'info' : 'outline-info'} btn-sm`} disabled={cpage === 1} onClick={() => changePage(cpage - 1)}>
                &lt;
            </button>
        );

        // 2. 숫자 페이지 버튼들 생성 (startPage부터 endPage까지 반복)
        for(let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {

            // 현재 페이지 번호와 일치하면 색상을 info(색 채워짐), 아니면 outline-info(테두리만)로 설정합니다.
            // 아이템 리스트가 비어있으면(listCount === 0) 클릭할 수 없게 disabled 처리합니다.
            btnArr.push(
                <button key={ p } className={`btn btn-${cpage === p ? 'info' : 'outline-info'} btn-sm`} disabled={pageInfo.listCount === 0} onClick={() => changePage(p)}>
                    { p }
                </button>
            );
        }

        // 3. [>] 다음 페이지 버튼 생성
        // 현재 페이지가 마지막 페이지(safeMaxPage)이거나 결과가 없으면 비활성화합니다.
        btnArr.push(
            <button key="next" className={`btn btn-${cpage === pageInfo.maxPage ? 'info' : 'outline-info'} btn-sm`} disabled={cpage === safeMaxPage || pageInfo.listCount === 0} onClick={() => changePage(cpage + 1)}>
                &gt;
            </button>
        );

        // 완성된 페이징 버튼 배열을 State에 저장하여 화면 하단에 렌더링되게 합니다.
        setPageList(btnArr);

    };

    // return 구문 - 실제 화면에 렌더링되는 JSX (HTML 구조) 영역입니다.
    return (
        <div>
            {/* 상단 검색 필터 테이블 영역 */}
            <table align="left">
                <tbody>
                    <tr>
                        <td>지역 : </td>
                        <td>
                            {/* 지역 선택 셀렉트 박스. value는 inputData State와 동기화됩니다. */}
                            <select className="form-control" value={ inputData.regionName } onChange={ handleChange } name="regionName">
                                <option value="">전체</option>
                                <option value="강원">강원</option>
                                <option value="제주">제주</option>
                                <option value="부산">부산</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>상태 : </td>
                        <td>
                            {/* 시설 유형(숙소/공유오피스) 선택 셀렉트 박스 */}
                            <select className="form-control" value={ inputData.hubType } onChange={ handleChange } name="hubType">
                                <option value="">전체</option>
                                <option value="1">숙소</option>
                                <option value="2">공유오피스</option>
                            </select>
                        </td>
                        <td>
                            {/* 검색어 입력창 및 검색 실행(돋보기) 버튼 묶음 */}
                            <div className="input-group">
                                <input type="search" className="form-control" placeholder="거점 이름을 입력해주세요." name="keyword" onChange={ handleChange } value={ inputData.keyword } size="50" />
                                <button type="submit" className="btn btn-outline-secondary" onClick={ handleClick }>🔍</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            {/* 우측 상단 AI 추천 페이지로 이동하는 버튼 영역 */}
            <div align="right">
                <button type="button" id="AI" onClick={ () => { navigate("/placeInfo/ai"); } }>AI에게 장소 및 일정 추천 받기</button>
            </div>
            <br />
            <br />
            
            {/* 거점 목록이 나열되는 메인 테이블 영역 */}
            <table className="table table-hover">
                <thead></thead>
                <tbody>
                    {/* 하드코딩된 예시용 더미 데이터 1 */}
                    <tr>
                        <td>
                            <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260107_162%2F1767772273655wAbv4_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25C3%25E1%25C3%25B5_%25B3%25B2%25C0%25CC%25BC%25B6_%25C1%25A4%25B0%25FC%25B7%25E7_%25C0%25FC%25B0%25E6.jpg" width="300" />
                        </td>
                        <td>
                            <p>
                            주소 : 강원 춘천시 남산면 방하리 198-1<br />
                            거점 이름 : 춘천 남이섬 호텔 정관루점<br />
                            전화번호 : 0507-1313-5817<br />
                            시설 유형 : 숙소
                            </p> 
                        </td>
                    </tr>
                    
                    {/* 하드코딩된 예시용 더미 데이터 2 */}
                    <tr>
                        <td>
                            <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260107_162%2F1767772273655wAbv4_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25C3%25E1%25C3%25B5_%25B3%25B2%25C0%25CC%25BC%25B6_%25C1%25A4%25B0%25FC%25B7%25E7_%25C0%25FC%25B0%25E6.jpg" width="300" />
                        </td>
                        <td>
                            <p>
                            주소 : 강원 춘천시 남산면 방하리 198-1<br />
                            거점 이름 : 춘천 남이섬 호텔 정관루점<br />
                            전화번호 : 0507-1313-5817<br />
                            시설 유형 : 공유 오피스
                            </p> 
                        </td>
                    </tr>
                    
                    {/* 서버로부터 받아와서 생성한 실제 아이템 컴포넌트들(HubItemComponent)이 이 자리에 뿌려집니다. */}
                    { dataList }
                </tbody>
            </table>

            <br />

            {/* 페이징 버튼들이 들어가는 영역 */}
            <div align="center" className="paging-area">{ pageList }</div>

            <br />
            
            {/* 거점 등록 폼 페이지로 이동하는 하단 버튼 영역 */}
            <div>
                <button type="button" className="btn btn-primary btn-sm" onClick={ () => { navigate("/placeInfo/enrollForm") } }>▶ 거점 등록</button>
            </div>
            <br /><br />

        </div>
    )
}

export default HubListComponent;