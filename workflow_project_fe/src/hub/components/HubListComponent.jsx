import "../styles/Hub.css"

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { selectHubListApi, searchHubListApi } from "../api/hubApi";

import HubItemComponent from "./HubItemComponent";

function HubListComponent(props) {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const loginUser = props.loginUser;
    
    // URL 쿼리 파라미터 추출 및 기본값 설정
    const cpage = parseInt(searchParams.get("cpage")) || 1;
    const mainRegion = searchParams.get("mainRegion") || "";
    const subRegion = searchParams.get("subRegion") || "";
    const hubType = searchParams.get("hubType") || "";
    const keyword =searchParams.get("keyword") || "";
    
    // 상태 관리 (검색폼, 리스트 데이터, 페이징 버튼)
    const [inputData, setInputData] = useState({mainRegion, hubType, keyword});
    const [dataList, setDataList] = useState([]);
    const [pageList, setPageList] = useState([]);

    // URL 파라미터 변경 시 검색 폼 상태 동기화
    useEffect(() => {
        setInputData({ mainRegion, subRegion, hubType, keyword });
    }, [mainRegion, subRegion, hubType, keyword]);

    // 검색 조건 변경 및 페이지 이동 시 데이터 갱신
    useEffect(() => {
        if(!mainRegion && !subRegion && !hubType && !keyword) {
            selectHubList();
        } else {
            searchHubList();
        }
    }, [cpage, mainRegion, subRegion, hubType, keyword]);

    // mainRegion에 따른 subRegion Select 렌더링
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

    // 전체 거점 목록 조회
    const selectHubList = async () => {
        try {
            const response = await selectHubListApi(cpage);
            handleResponse(response);
        } catch(error) {
            console.error(error);
        }
    };

    // 조건부 거점 목록 검색
    const searchHubList = async () => {
        try {
            const response = await searchHubListApi(cpage, { mainRegion, subRegion, hubType, keyword });
            handleResponse(response);
        } catch(error) {
            console.error(error);
        }
    };

    // 검색 조건 입력 핸들러
    const handleChange = e => {
       setInputData({...inputData, [e.target.name]: e.target.value});
    };

    // 검색 실행 핸들러 (URL 파라미터 업데이트를 통한 재조회 트리거)
    const handleClick = e => {
        e.preventDefault();
        setSearchParams({
            cpage : 1,
            mainRegion : inputData.mainRegion,
            subRegion : inputData.subRegion,
            hubType : inputData.hubType,
            keyword : inputData.keyword
        });
    };

    // API 응답 데이터 처리 및 페이징 구성
    const handleResponse = response => {
        const pageInfo = response.data.pi;
        const items = response.data.list;

        // 관리자가 아닐 경우 CLOSED 상태의 거점 제외
        const filteredItems = items.filter(item => loginUser.authCode === "ADMIN" || item.hubStatus !== "CLOSED");

        const trArr = filteredItems.map((item, index) => (
            <HubItemComponent key={index} item={item} />
        ));;

        setDataList(trArr);
        
        const btnArr = []

        const changePage = (p) => {
            const params = { cpage: p };
            if (mainRegion) params.mainRegion = mainRegion;
            if (subRegion) params.subRegion = subRegion;
            if (hubType) params.hubType = hubType;
            if (keyword) params.keyword = keyword;

            setSearchParams(params);
        };

        // 페이징 버튼 렌더링
        if (pageInfo.listCount > 0 && filteredItems.length > 0) {
            
            // 이전 버튼
            btnArr.push(
                <button key="prev" className="btn btn-outline-info btn-sm" style={{ border: "1px solid currentColor" }} disabled={cpage === 1} onClick={() => changePage(cpage - 1)}>
                    &lt;
                </button>
            );

            // 페이지 번호
            for(let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {
                btnArr.push(
                    <button key={ p } className={`btn btn-${cpage === p ? 'info' : 'outline-info'} btn-sm`} onClick={() => changePage(p)}>
                        { p }
                    </button>
                );
            }

            // 다음 버튼
            const safeMaxPage = pageInfo.maxPage === 0 ? 1 : pageInfo.maxPage;
            btnArr.push(
                <button key="next" className="btn btn-outline-info btn-sm" style={{ border: "1px solid currentColor" }} disabled={cpage === safeMaxPage} onClick={() => changePage(cpage + 1)}>
                    &gt;
                </button>
            );
        }

        setPageList(btnArr);
    };

    // return 구문
    return (
        <div className="hub-content">
            <div className="position-relative d-flex align-items-center w-100 mb-4 hub-list-header">
                <h2 className="m-0 w-100 text-center"><b>거점 목록</b></h2>
                <button className="btn btn-outline-dark" onClick={ () => { navigate("/place/list") } }>지역 정보 목록으로</button>
            </div>
            <br />

            {/* 검색 필터 영역 */}
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
            
            <div align="right">
                <button type="button" id="AI" onClick={ () => { navigate("/hub/ai"); } }>AI에게 장소 및 일정 추천 받기</button>
            </div>
            
            <div style={{ height: "30px" }}></div>

            {/* 거점 목록 테이블 */}
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

            <div align="center" className="paging-area">{ pageList }</div>

            <br />
            
            {/* 관리자용 거점 등록 버튼 */}
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