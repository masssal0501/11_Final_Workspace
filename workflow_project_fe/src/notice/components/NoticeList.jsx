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

    if (loading) {

        return (

            <div className="notice-container">

                <div className="notice-loading">

                    공지사항을 불러오는 중입니다.

                </div>

            </div>

        );

    }


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="notice-container">


            {/* =================================================
                헤더
            ================================================= */}

            <div className="notice-header">

                <h2>
                    공지사항
                </h2>


                {/* 
                 * 현재는 임시로 모두에게 표시
                 *
                 * 추후 관리자 권한 체크 후
                 * 관리자에게만 표시하면 됨
                 */}

                <button
                    type="button"
                    className="notice-btn primary"
                    onClick={handleInsert}
                >
                    공지사항 등록
                </button>

            </div>


            {/* =================================================
                검색창
            ================================================= */}

            <form
                onSubmit={handleSearch}
                className="notice-search"
            >


                <select
                    value={condition}
                    onChange={(e) =>
                        setCondition(
                            e.target.value
                        )
                    }
                    style={{
                        height: '40px',
                        padding: '0 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
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
                >
                    검색
                </button>


            </form>


            {/* =================================================
                목록
            ================================================= */}

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
                        noticeList.length === 0

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

    );

}

