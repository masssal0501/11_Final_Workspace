import { useState, useEffect } from "react";
import "../styles/HubListComponent.css"
import { useSearchParams } from "react-router-dom";

function HubListComponent() {

    const [inputData, setInputData] = useState({regionName: "전체",
                                                  hubType: "0",
                                                  keyword: ""
    });

    const [searchParams, setSearchParams] = useSearchParams();

    const searchInputData = searchParams.get("inputData") || "";

    const cpage = parseInt(searchParams.get("cpage")) || 1;

    const [dataList, setDataList] = useState([]);

    const [pageList, setPageList] = useState([]);

    useEffect(() => {

        if(inputData.regionName == "전체" && inputData.hubType == "0" && inputData.keyword == "") {

            selectHubList();

        } else {

            searchHubList();
        }
    }, [cpage, searchInputData]);

    const selectHubList = async () => {

        try {

            // const response = await selectHubListApi(cpage);

        } catch(error) {

            console.log("거점 목록 조회용 ajax 통신 실패!");
        }
    };

    const handleChange = e => {
        
        const newInputData = {...inputData}
        newInputData[e.target.name] = e.target.value
        setInputData(newInputData);

    };

    const handleClick = e => {

        e.preventDefault();

        setSearchParams({ cpage : 1, inputData : inputData });
    };

    const searchHubList = async () => {

        try {

            // const response = await searchBoardListApi(cpage, searchInputData);

        } catch(error) {

            console.log("거점 검색용 ajax 통신 실패!");
        }
    };

    const handleResponse = response => {

        const items = response.data.list;

        const trArr = items.map((item, index) => {

            return(
                // <HubItemComponent key={ index } item={ item } />
                <div></div>
            );
        });

        setDataList(trArr);

        const pageInfo = response.data.pi;

        const btnArr = []

        if(cpage == 1) {

            btnArr.push(
                <button key="prev" className="btn btn-info btn-sm">
                    &lt;
                </button>
            );

        } else {

            btnArr.push(
                <button key="prev" className="btn btn-outline-info btn-sm"
                        onClick={ () => {
                            setSearchParams({ cpage : cpage - 1, inputData : searchInputData });
                        } }>
                    &lt;
                </button>
            );
        } 

        for(let p = pageInfo.startPage; p <= pageInfo.endPage; p++) {

            if(cpage == p) {

                btnArr.push(
                    <button key={ p } className="btn btn-info btn-sm">
                        { p }
                    </button>
                );

            } else {

                btnArr.push(
                    <button key={ p } className="btn btn-outline-info btn-sm"
                            onClick={ () => {
                                setSearchParams({ cpage : p, inputData : searchInputData });
                            } }>
                        { p }
                    </button>
                );
            }
        }

        if(cpage == pageInfo.maxPage) {

            btnArr.push(
                <button key="next" className="btn btn-info btn-sm">
                    &gt;
                </button>
            );

        } else {

            btnArr.push(
                <button key="next" className="btn btn-outline-info btn-sm"
                        onClick={ () => {
                            setSearchParams({ cpage : cpage + 1, inputData : searchInputData });
                        } }>
                    &gt;
                </button>
            );
        }

        setPageList(btnArr);

    };

    // return 구문
    return (
        <div>
            <table align="left">
                <tbody>
                    <tr>
                        <td>지역 : </td>
                        <td>
                            <select className="form-control" value={ inputData.regionName } onChange={ handleChange } name="regionName">
                                <option value="전체">전체</option>
                                <option value="강원">강원</option>
                                <option value="제주">제주</option>
                                <option value="부산">부산</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>상태 : </td>
                        <td>
                            <select className="form-control" value={ inputData.hubType } onChange={ handleChange } name="hubType">
                                <option value="0">전체</option>
                                <option value="1">숙소</option>
                                <option value="2">공유오피스</option>
                            </select>
                        </td>
                        <td>
                            <input type="search" className="form-control" placeholder="거점 이름을 입력해주세요." name="keyword" onChange={ handleChange } value={ inputData.keyword } size="50" />
                        </td>
                        <td>
                            <button type="submit" className="btn btn-dark" onClick={ handleClick }>🔍</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div align="right">
                <button type="button" id="AI">AI에게 장소 및 일정 추천 받기</button>
            </div>
            <br />
            <br />
            <div className="list-area">
                <table className="table table-hover">
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td>
                                <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260107_162%2F1767772273655wAbv4_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25C3%25E1%25C3%25B5_%25B3%25B2%25C0%25CC%25BC%25B6_%25C1%25A4%25B0%25FC%25B7%25E7_%25C0%25FC%25B0%25E6.jpg" width="300" />
                            </td>
                            <td>
                                <p>
                                주소 : 강원 춘천시 남산면 방하리 198-1<br />
                                거점 이름 : 춘천 남이섬 호텔 정관루점<br />
                                이용 시간 : 09:00 ~ 22:00<br />
                                전화번호 : 0507-1313-5817<br />
                                </p> 
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260107_162%2F1767772273655wAbv4_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25C3%25E1%25C3%25B5_%25B3%25B2%25C0%25CC%25BC%25B6_%25C1%25A4%25B0%25FC%25B7%25E7_%25C0%25FC%25B0%25E6.jpg" width="300" />
                            </td>
                            <td>
                                <p>
                                주소 : 강원 춘천시 남산면 방하리 198-1<br />
                                거점 이름 : 춘천 남이섬 호텔 정관루점<br />
                                이용 시간 : 09:00 ~ 22:00<br />
                                전화번호 : 0507-1313-5817<br />
                                </p> 
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default HubListComponent;