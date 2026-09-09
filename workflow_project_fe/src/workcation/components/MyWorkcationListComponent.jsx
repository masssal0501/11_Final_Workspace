import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    getMainRegionList,
    getSubRegionList,
    getMyWorkcationList
} from "../api/WorkcationApi";

import "../styles/MyWorkcationList.css";

function MyWorkcationListComponent() {

    const navigate = useNavigate();

    // 지역
    const [mainRegion, setMainRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");

    const [mainRegionList, setMainRegionList] = useState([]);
    const [subRegionList, setSubRegionList] = useState([]);

    // 상태
    const [searchType, setSearchType] = useState("all");

    // URL 페이지 정보
    const [searchParams, setSearchParams] = useSearchParams();

    const cpage =
        parseInt(searchParams.get("cpage")) || 1;

    // 목록
    const [workcationList, setWorkcationList] = useState([]);

    // 전체 페이지 수
    const [totalPages, setTotalPages] = useState(1);


    // ==============================
    // 1. 메인 지역 조회
    // ==============================
    useEffect(() => {

        getMainRegionList()
            .then(res => {

                const data =
                    Array.isArray(res)
                        ? res
                        : (res.list || []);

                setMainRegionList(data);
            })
            .catch(err => {
                console.error(
                    "메인 지역 조회 실패",
                    err
                );
            });

    }, []);


    // ==============================
    // 2. 상세 지역 조회
    // ==============================
    useEffect(() => {

        if (!mainRegion) {

            setSubRegion("");
            setSubRegionList([]);

            return;
        }

        getSubRegionList(mainRegion)
            .then(res => {

                const data =
                    Array.isArray(res)
                        ? res
                        : (res.list || []);

                setSubRegionList(data);
            })
            .catch(err => {

                console.error(
                    "상세 지역 조회 실패",
                    err
                );
            });

    }, [mainRegion]);


    // ==============================
    // 3. 내 워케이션 목록 조회
    // ==============================
    useEffect(() => {

        // 메인 지역 선택 후
        // 상세지역 선택 전에는 조회하지 않음
        if (mainRegion && !subRegion) {
            return;
        }

        selectMyWorkcationList();

    }, [
        cpage,
        mainRegion,
        subRegion,
        searchType
    ]);


    // ==============================
    // 목록 조회
    // ==============================
    const selectMyWorkcationList = async () => {

        try {

            const response = await getMyWorkcationList({

                cpage: cpage,

                condition: "all",
                keyword: "",

                mainRegion: mainRegion,
                subRegion: subRegion,

                searchType: searchType
            });


            console.log(
                "마이페이지 워케이션 목록:",
                response
            );


            const list =
                Array.isArray(response)
                    ? response
                    : (
                        response?.list ||
                        response?.content ||
                        []
                    );


            setWorkcationList(list);

            setTotalPages(
                response?.totalPages || 1
            );

        } catch (error) {

            console.error(
                "내 워케이션 목록 조회 실패",
                error
            );

            setWorkcationList([]);
        }
    };


    // ==============================
    // 메인 지역 변경
    // ==============================
    const handleMainRegionChange = (e) => {

        const value = e.target.value;

        setMainRegion(value);
        setSubRegion("");

        setSearchParams({
            cpage: 1
        });
    };


    // ==============================
    // 상세 지역 변경
    // ==============================
    const handleSubRegionChange = (e) => {

        const value = e.target.value;

        setSubRegion(value);

        setSearchParams({
            cpage: 1
        });
    };


    // ==============================
    // 상태 변경
    // ==============================
    const handleSearchTypeChange = (e) => {

        const value = e.target.value;

        setSearchType(value);

        setSearchParams({
            cpage: 1
        });
    };


    // ==============================
    // 페이지 변경
    // ==============================
    const changePage = (page) => {

        setSearchParams({
            cpage: page
        });
    };


    // 상태 코드를 한글 라벨 + 배지 톤으로 변환(표시 전용, 데이터 값은 변경하지 않음)
    // 기존에는 approverState 코드값("W"/"A"/"J" 등)이 번역 없이 그대로 노출되던 문제가 있었다.
    const renderStatusBadge = (item) => {
        const raw = item.approverState || item.workcationStatus || "W";
        const labelMap = { W: "대기", A: "승인", C: "취소", H: "보류", J: "반려", R: "검토" };
        const toneMap = {
            W: "bg-warning", A: "bg-success", C: "bg-secondary",
            H: "bg-secondary", J: "bg-danger", R: "bg-primary",
        };
        const label = labelMap[raw] || raw;
        const tone = toneMap[raw] || "bg-primary";
        return <span className={`badge ${tone}`}>{label}</span>;
    };

    return (

        <main className="wf-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">내 워케이션</h1>
                    <p className="wf-page-description">내가 신청한 워케이션의 진행 현황을 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">

            {/* =========================
                필터 영역
            ========================= */}
            <div className="workcation-btnSet">

                {/* 지역 */}
                <div className="drop-group">

                    <select
                        className="main-region"
                        value={mainRegion}
                        onChange={
                            handleMainRegionChange
                        }
                    >

                        <option value="">
                            지역명
                        </option>

                        {
                            mainRegionList.map(
                                (main, index) => {

                                    const value =
                                        typeof main === "string"
                                            ? main
                                            : main.main_region;

                                    return (
                                        <option
                                            key={index}
                                            value={value}
                                        >
                                            {value}
                                        </option>
                                    );
                                }
                            )
                        }

                    </select>


                    <select
                        className="sub-region"
                        value={subRegion}
                        onChange={
                            handleSubRegionChange
                        }
                        disabled={!mainRegion}
                    >

                        <option value="">
                            상세 지역명
                        </option>

                        {
                            subRegionList.map(
                                (sub, index) => {

                                    const value =
                                        typeof sub === "string"
                                            ? sub
                                            : sub.sub_region;

                                    return (
                                        <option
                                            key={index}
                                            value={value}
                                        >
                                            {value}
                                        </option>
                                    );
                                }
                            )
                        }

                    </select>

                </div>


                {/* 상태 */}
                <select
                    className="status-drop"
                    value={searchType}
                    onChange={
                        handleSearchTypeChange
                    }
                >

                    <option value="all">
                        전체
                    </option>

                    <option value="approved">
                        승인
                    </option>

                    <option value="canceled">
                        취소
                    </option>

                    <option value="hold">
                        보류
                    </option>

                    <option value="rejected">
                        반려
                    </option>

                    <option value="review">
                        검토
                    </option>

                </select>

            </div>


            {/* =========================
                목록
            ========================= */}
            <table className="workcation-list">

                <thead>

                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>지역</th>
                        <th>신청일</th>
                        <th>상태</th>
                    </tr>

                </thead>


                <tbody>

                    {
                        workcationList.length > 0
                            ? workcationList.map(
                                (item) => {

                                    const main =
                                        item.mainRegion || "";

                                    const sub =
                                        item.subRegion || "";

                                    const region =
                                        `${main} ${sub}`.trim() || "-";


                                    return (

                                        <tr
                                            key={
                                                item.workcationNo
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/workcation/mydetail/${item.workcationNo}`
                                                )
                                            }
                                            style={{
                                                cursor: "pointer"
                                            }}
                                        >

                                            <td>
                                                {
                                                    item.workcationNo
                                                }
                                            </td>


                                            <td
                                                style={{
                                                    whiteSpace:
                                                        "pre-line"
                                                }}
                                            >
                                                {
                                                    item.workcationTitle
                                                }
                                            </td>


                                            <td>
                                                {region}
                                            </td>


                                            <td>
                                                {
                                                    item.createdAt
                                                        ? item.createdAt.substring(
                                                            0,
                                                            10
                                                        )
                                                        : "-"
                                                }
                                            </td>


                                            <td>
                                                {renderStatusBadge(item)}
                                            </td>

                                        </tr>
                                    );
                                }
                            )

                            :

                            <tr className="wf-empty-row">

                                <td colSpan={5}>
                                    신청한 워케이션 내역이 없습니다.
                                </td>

                            </tr>
                    }

                </tbody>

            </table>


            <br />
            <br />


            {/* =========================
                페이징
            ========================= */}
            <div
                align="center"
                className="paging-area"
            >

                {/* 이전 */}

                <button
                    className="page-btn"
                    disabled={cpage === 1}
                    onClick={() =>
                        changePage(cpage - 1)
                    }
                >
                    &lt;
                </button>


                {/* 페이지 번호 */}

                {
                    Array.from(
                        {
                            length:
                                totalPages
                        },
                        (_, index) =>
                            index + 1
                    ).map(page => (

                        <button

                            key={page}

                            className={
                                `page-btn ${
                                    cpage === page
                                        ? "active"
                                        : ""
                                }`
                            }

                            onClick={() =>
                                changePage(page)
                            }

                        >
                            {page}
                        </button>
                    ))
                }


                {/* 다음 */}

                <button
                    className="page-btn"
                    disabled={
                        cpage === totalPages
                    }
                    onClick={() =>
                        changePage(cpage + 1)
                    }
                >
                    &gt;
                </button>

            </div>

            </div>
        </main>
    );
}

export default MyWorkcationListComponent;