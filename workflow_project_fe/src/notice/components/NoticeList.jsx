import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeList() {

    const navigate = useNavigate();

    const [noticeList, setNoticeList] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // 현재 페이지
    // =========================================================

    const [currentPage, setCurrentPage] = useState(1);

    // 한 페이지에 보여줄 개수
    const [limit] = useState(10);

    // 전체 게시글 수
    const [listCount, setListCount] = useState(0);

    // 페이지 버튼 개수
    const pageSize = 5;


    // =========================================================
    // 검색 상태
    // =========================================================

    const [condition, setCondition] = useState('title');

    const [keyword, setKeyword] = useState('');

    const [searchKeyword, setSearchKeyword] = useState('');


    // =========================================================
    // 공지사항 조회
    // =========================================================

    const fetchNoticeList = async (
        page,
        searchCondition,
        searchKw
    ) => {

        try {

            setLoading(true);

            const data =
                await noticeApi.getNoticeList(
                    page,
                    limit,
                    searchCondition,
                    searchKw
                );

            console.log(
                '공지사항 목록:',
                data
            );


            // 서버 응답
            //
            // {
            //     noticeList: [...],
            //     limit: 10,
            //     page: 1,
            //     listCount: 10
            // }

            setNoticeList(
                Array.isArray(data?.noticeList)
                    ? data.noticeList
                    : []
            );

            setListCount(
                Number(data?.listCount ?? 0)
            );


        } catch (error) {

            console.error(
                '공지사항 목록 조회 실패:',
                error
            );

            setNoticeList([]);

            setListCount(0);


        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // 페이지 또는 검색어 변경 시 조회
    // =========================================================

    useEffect(() => {

        fetchNoticeList(
            currentPage,
            condition,
            searchKeyword
        );

    }, [
        currentPage,
        searchKeyword
    ]);


    // =========================================================
    // 검색
    // =========================================================

    const handleSearch = (e) => {

        e.preventDefault();

        // 검색 시 1페이지로 이동
        setCurrentPage(1);

        // 실제 검색어 적용
        setSearchKeyword(keyword);

    };


    // =========================================================
    // 공지사항 등록
    // =========================================================

    const handleInsert = () => {

        navigate('/notice/insert');

    };


    // =========================================================
    // 로그인 사용자 정보 (관리자만 등록 버튼 노출)
    // =========================================================

    const loginUser =
        JSON.parse(
            localStorage.getItem('user')
        );

    const isAdmin =
        loginUser?.authCode === 'ADMIN';


    // =========================================================
    // 날짜
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return '-';

        }


        const d = new Date(date);


        if (isNaN(d.getTime())) {

            return '-';

        }


        return d.toLocaleDateString(
            'ko-KR'
        );

    };


    // =========================================================
    // 페이징 계산
    // =========================================================

    const maxPage =
        Math.ceil(
            listCount / limit
        );


    const startPage =
        Math.floor(
            (currentPage - 1) /
            pageSize
        ) * pageSize + 1;


    const endPage =
        Math.min(
            startPage + pageSize - 1,
            maxPage
        );


    // =========================================================
    // 페이지 이동
    // =========================================================

    const handlePageChange = (page) => {

        if (
            page < 1 ||
            page > maxPage
        ) {

            return;

        }


        setCurrentPage(page);


        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });

    };


    // =========================================================
    // 로딩
    // =========================================================

    // =========================================================
    // 화면
    // =========================================================

    return (

        <main className="notice-container">


            {/* =================================================
                헤더
            ================================================= */}

            <section className="notice-header wf-page-header">

                <div>
                    <h1 className="wf-page-title">공지사항</h1>
                    <p className="wf-page-description">전사 공지사항을 확인합니다.</p>
                </div>


                {isAdmin && (

                    <div className="wf-page-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleInsert}
                        >
                            + 공지사항 등록
                        </button>
                    </div>

                )}

            </section>

            <div className="wf-page-content">

            {/* =================================================
                검색창
            ================================================= */}

            <form
                onSubmit={handleSearch}
                className="notice-search"
            >


                <select
                    className="form-select"
                    style={{ width: '140px' }}
                    value={condition}
                    onChange={(e) =>
                        setCondition(
                            e.target.value
                        )
                    }
                >

                    <option value="title">
                        제목
                    </option>

                    <option value="content">
                        내용
                    </option>

                    <option value="writer">
                        작성자
                    </option>

                    <option value="titleContent">
                        제목+내용
                    </option>

                </select>


                <input
                    type="text"
                    className="form-control"
                    style={{ width: '350px' }}
                    placeholder="검색어를 입력해주세요."
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(
                            e.target.value
                        )
                    }
                />


                <button
                    type="submit"
                    className="btn btn-outline-primary"
                >
                    검색
                </button>


            </form>


            {/* =================================================
                목록
            ================================================= */}

            <div className="notice-table-wrap">
            <table className="notice-table">


                <thead>

                    <tr>

                        <th>
                            번호
                        </th>

                        <th>
                            제목
                        </th>

                        <th>
                            작성자
                        </th>

                        <th>
                            작성일
                        </th>

                        <th>
                            조회수
                        </th>

                    </tr>

                </thead>


                <tbody>


                    {
                        loading

                        ? (

                            <tr>
                                <td colSpan="5" className="notice-empty">
                                    공지사항을 불러오는 중입니다.
                                </td>
                            </tr>

                        )

                        : noticeList.length === 0

                        ?

                        (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="notice-empty"
                                >

                                    등록된 공지사항이 없습니다.

                                </td>

                            </tr>

                        )

                        :

                        noticeList.map(
                            (notice) => (

                                <tr
                                    key={
                                        notice.noticeNo
                                    }
                                    className="notice-row"
                                    onClick={() =>
                                        navigate(
                                            `/notice/${notice.noticeNo}`
                                        )
                                    }
                                >


                                    {/* 번호 */}

                                    <td>

                                        {
                                            notice.noticeNo
                                        }

                                    </td>


                                    {/* 제목 */}

                                    <td className="notice-title-cell">


                                        {

                                            notice.noticeStatus ===
                                            'IMPORTANT'

                                            &&

                                            (

                                                <span className="notice-important">

                                                    중요

                                                </span>

                                            )

                                        }


                                        {
                                            notice.noticeTitle
                                        }


                                    </td>


                                    {/* 작성자 */}

                                    <td>

                                        {
                                            notice.empName ||
                                            '-'
                                        }

                                    </td>


                                    {/* 작성일 */}

                                    <td>

                                        {
                                            formatDate(
                                                notice.createdAt
                                            )
                                        }

                                    </td>


                                    {/* 조회수 */}

                                    <td>

                                        {
                                            notice.viewCount ??
                                            0
                                        }

                                    </td>


                                </tr>

                            )

                        )

                    }


                </tbody>


            </table>
            </div>


            {/* =================================================
                페이징
            ================================================= */}

            {

                maxPage > 0

                &&

                (

                    <div className="notice-pagination">


                        {/* 처음 */}

                        <button
                            type="button"
                            disabled={
                                currentPage === 1
                            }
                            onClick={() =>
                                handlePageChange(1)
                            }
                        >

                            «

                        </button>


                        {/* 이전 */}

                        <button
                            type="button"
                            disabled={
                                currentPage === 1
                            }
                            onClick={() =>
                                handlePageChange(
                                    currentPage - 1
                                )
                            }
                        >

                            ‹

                        </button>


                        {/* 숫자 */}

                        {

                            Array.from(

                                {

                                    length:
                                        endPage -
                                        startPage +
                                        1

                                },

                                (_, index) => {


                                    const page =
                                        startPage +
                                        index;


                                    return (

                                        <button
                                            key={page}
                                            type="button"
                                            className={
                                                currentPage ===
                                                page
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    page
                                                )
                                            }
                                        >

                                            {page}

                                        </button>

                                    );

                                }

                            )

                        }


                        {/* 다음 */}

                        <button
                            type="button"
                            disabled={
                                currentPage ===
                                maxPage
                            }
                            onClick={() =>
                                handlePageChange(
                                    currentPage + 1
                                )
                            }
                        >

                            ›

                        </button>


                        {/* 마지막 */}

                        <button
                            type="button"
                            disabled={
                                currentPage ===
                                maxPage
                            }
                            onClick={() =>
                                handlePageChange(
                                    maxPage
                                )
                            }
                        >

                            »

                        </button>


                    </div>

                )

            }

            </div>

        </main>

    );

}

