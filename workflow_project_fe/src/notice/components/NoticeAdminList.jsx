import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeAdminList() {

    const navigate = useNavigate();

    // =========================================================
    // 상태
    // =========================================================

    const [noticeList, setNoticeList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);

    // 한 페이지 게시글 수
    const limit = 10;

    // 전체 게시글 수
    const [listCount, setListCount] = useState(0);

    // 한 번에 보여줄 페이지 번호
    const pageSize = 5;

    // 검색 조건
    const [condition, setCondition] = useState('title');

    // 검색 입력값
    const [keyword, setKeyword] = useState('');

    // 실제 검색에 사용되는 검색어
    const [searchKeyword, setSearchKeyword] = useState('');


    // =========================================================
    // 공지사항 목록 조회
    // =========================================================

    const fetchNoticeList = async () => {

        try {

            setLoading(true);

            const data = await noticeApi.getNoticeList(
                currentPage,
                limit,
                condition,
                searchKeyword
            );

            console.log('관리자 공지사항 목록:', data);

            // 목록
            setNoticeList(
                Array.isArray(data.noticeList)
                    ? data.noticeList
                    : []
            );

            // 전체 게시글 수
            setListCount(
                Number(data.listCount ?? 0)
            );

        } catch (error) {

            console.error(
                '관리자 공지사항 목록 조회 실패:',
                error
            );

            setNoticeList([]);
            setListCount(0);

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // 페이지 / 검색 조건 변경 시 목록 조회
    // =========================================================

    useEffect(() => {

        fetchNoticeList();

    }, [currentPage, searchKeyword]);


    // =========================================================
    // 검색
    // =========================================================

    const handleSearch = (e) => {

        e.preventDefault();

        // 검색 조건이 바뀌었지만 검색어가 같아도
        // 다시 조회할 수 있도록 페이지를 1로 이동
        setCurrentPage(1);

        setSearchKeyword(keyword);

    };


    // =========================================================
    // 날짜 포맷
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return '-';
        }

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return '-';
        }

        return d.toLocaleDateString('ko-KR');

    };


    // =========================================================
    // 공지사항 삭제
    // =========================================================

    const handleDelete = async (e, noticeNo) => {

        e.stopPropagation();

        const confirmed = window.confirm(
            '이 공지사항을 삭제하시겠습니까?'
        );

        if (!confirmed) {
            return;
        }

        try {

            await noticeApi.deleteNotice(noticeNo);

            alert('삭제되었습니다.');

            /*
             * 현재 페이지에 글이 하나만 있었고
             * 1페이지가 아니라면 이전 페이지로 이동
             */
            if (
                noticeList.length === 1 &&
                currentPage > 1
            ) {

                setCurrentPage(
                    currentPage - 1
                );

            } else {

                // 현재 페이지 다시 조회
                await fetchNoticeList();

            }

        } catch (error) {

            console.error(
                '공지사항 삭제 실패:',
                error
            );

            alert(
                error.response?.data ||
                '공지사항 삭제에 실패했습니다.'
            );

        }

    };


    // =========================================================
    // 페이징 계산
    // =========================================================

    const maxPage = Math.ceil(
        listCount / limit
    );

    const startPage =
        Math.floor(
            (currentPage - 1) / pageSize
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
                관리자 헤더
            ================================================= */}

            <div className="notice-header">

                <h2>
                    공지사항 관리
                </h2>

                <button
                    type="button"
                    className="notice-btn primary"
                    onClick={() =>
                        navigate('/admin/notice/insert')
                    }
                >
                    공지사항 등록
                </button>

            </div>


            {/* =================================================
                검색
            ================================================= */}

            <form
                onSubmit={handleSearch}
                className="notice-search"
            >

                <select
                    value={condition}
                    onChange={(e) =>
                        setCondition(e.target.value)
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
                        setKeyword(e.target.value)
                    }
                />


                <button type="submit">
                    검색
                </button>

            </form>


            {/* =================================================
                공지사항 목록
            ================================================= */}

            <table className="notice-table">

                <thead>

                    <tr>

                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>
                        <th>관리</th>

                    </tr>

                </thead>


                <tbody>

                    {noticeList.length === 0 ? (

                        <tr>

                            <td
                                colSpan="6"
                                className="notice-empty"
                            >
                                등록된 공지사항이 없습니다.
                            </td>

                        </tr>

                    ) : (

                        noticeList.map((notice) => (

                            <tr
                                key={notice.noticeNo}
                            >

                                {/* 번호 */}

                                <td>
                                    {notice.noticeNo}
                                </td>


                                {/* 제목 */}

                                <td
                                    className="notice-title-cell"
                                    onClick={() =>
                                        navigate(
                                            `/notice/${notice.noticeNo}`
                                        )
                                    }
                                >

                                    {notice.noticeStatus ===
                                        'IMPORTANT' && (

                                        <span className="notice-important">
                                            중요
                                        </span>

                                    )}

                                    {notice.noticeTitle}

                                </td>


                                {/* 작성자 */}

                                <td>
                                    {notice.empName || '-'}
                                </td>


                                {/* 작성일 */}

                                <td>
                                    {formatDate(
                                        notice.createdAt
                                    )}
                                </td>


                                {/* 조회수 */}

                                <td>
                                    {notice.viewCount ?? 0}
                                </td>


                                {/* 관리 */}

                                <td>

                                    <button
                                        type="button"
                                        onClick={(e) => {

                                            e.stopPropagation();

                                            navigate(
                                                `/admin/notice/update/${notice.noticeNo}`
                                            );

                                        }}
                                    >
                                        수정
                                    </button>


                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleDelete(
                                                e,
                                                notice.noticeNo
                                            )
                                        }
                                    >
                                        삭제
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>


            {/* =================================================
                페이징
            ================================================= */}

            {maxPage > 0 && (

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


                    {/* 페이지 번호 */}

                    {Array.from(
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
                                        currentPage === page
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={() =>
                                        handlePageChange(page)
                                    }
                                >
                                    {page}
                                </button>

                            );

                        }
                    )}


                    {/* 다음 */}

                    <button
                        type="button"
                        disabled={
                            currentPage === maxPage
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
                            currentPage === maxPage
                        }
                        onClick={() =>
                            handlePageChange(maxPage)
                        }
                    >
                        »
                    </button>

                </div>

            )}

        </div>

    );

}