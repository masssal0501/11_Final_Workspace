import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';


export default function AdminAmount() {

    console.log('🔥🔥 AdminAmount 컴포넌트 실행');


    const navigate = useNavigate();


    // =========================================================
    // 상태
    // =========================================================

    const [amounts, setAmounts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        pageLimit: 5,
        boardLimit: 10,
        maxPage: 1,
        startPage: 1,
        endPage: 1
    });


    // =========================================================
    // 관리자 전체 비용 신청 목록 조회
    // =========================================================

    const fetchAmountList = async (currentPage = 1) => {

        console.log('🔥 fetchAmountList 시작');
        console.log('🔥 요청 페이지:', currentPage);


        try {

            setLoading(true);


            console.log(
                '🔥 관리자 전체 비용 목록 API 호출:',
                currentPage
            );


            const data =
                await amountApi.getAmountList(currentPage);


            console.log(
                '📋 관리자 전체 정산 신청 목록 응답:',
                data
            );


            // =====================================================
            // 목록 데이터 처리
            // =====================================================

            let list = [];


            if (Array.isArray(data)) {

                list = data;

            } else if (Array.isArray(data?.list)) {

                list = data.list;

            }


            console.log(
                '📋 관리자 정산 신청 목록:',
                list
            );


            console.log(
                '📋 관리자 정산 신청 개수:',
                list.length
            );


            // =====================================================
            // 데이터 로그
            // =====================================================

            list.forEach((amount, index) => {

                console.log(
                    `===== 정산 데이터 ${index + 1} =====`
                );


                console.log(
                    '신청번호:',
                    amount.amountNo
                );


                console.log(
                    '사원명:',
                    amount.empName
                );


                console.log(
                    '워케이션 번호:',
                    amount.workcationNo
                );


                console.log(
                    '신청금액:',
                    amount.requestedAmount
                );


                console.log(
                    '승인금액:',
                    amount.approvedAmount
                );


                console.log(
                    '상태:',
                    amount.status
                );


                console.log(
                    '신청일:',
                    amount.requestedAt
                );

            });


            // =====================================================
            // 목록 저장
            // =====================================================

            setAmounts(list);


            // =====================================================
            // 페이징 정보 저장
            // =====================================================

            const newPageInfo = {

                currentPage:
                    Number(
                        data?.page ??
                        data?.currentPage ??
                        currentPage
                    ),

                pageLimit:
                    Number(
                        data?.pageLimit ??
                        5
                    ),

                boardLimit:
                    Number(
                        data?.boardLimit ??
                        data?.limit ??
                        10
                    ),

                maxPage:
                    Number(
                        data?.maxPage ??
                        1
                    ),

                startPage:
                    Number(
                        data?.startPage ??
                        1
                    ),

                endPage:
                    Number(
                        data?.endPage ??
                        1
                    )

            };


            console.log(
                '📄 페이징 정보:',
                newPageInfo
            );


            setPageInfo(newPageInfo);


        } catch (error) {

            console.error(
                '❌ 관리자 정산 신청 목록 조회 실패:',
                error
            );


            console.error(
                '❌ 서버 응답:',
                error.response?.data
            );


            console.error(
                '❌ HTTP 상태:',
                error.response?.status
            );


            setAmounts([]);


        } finally {

            console.log(
                '🔥 fetchAmountList finally'
            );


            setLoading(false);

        }

    };


    // =========================================================
    // 최초 진입
    // =========================================================

    useEffect(() => {

        console.log(
            '🔥🔥 AdminAmount useEffect 실행'
        );


        fetchAmountList(1);

    }, []);


    // =========================================================
    // 페이지 이동
    // =========================================================

    const handlePageChange = (newPage) => {

        console.log(
            '📄 페이지 이동:',
            newPage
        );


        // =====================================================
        // 페이지 범위 검사
        // =====================================================

        if (
            newPage < 1 ||
            newPage > pageInfo.maxPage
        ) {

            console.log(
                '⚠️ 잘못된 페이지:',
                newPage
            );


            return;

        }


        fetchAmountList(newPage);

    };


    // =========================================================
    // 날짜 포맷
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return '-';

        }


        const d = new Date(date);


        if (Number.isNaN(d.getTime())) {

            return '-';

        }


        const year =
            d.getFullYear();


        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, '0');


        const day =
            String(
                d.getDate()
            ).padStart(2, '0');


        return `${year}-${month}-${day}`;

    };


    // =========================================================
    // 금액 포맷
    // =========================================================

    const formatMoney = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {

            return '-';

        }


        const number =
            Number(value);


        if (Number.isNaN(number)) {

            return '-';

        }


        return `${number.toLocaleString('ko-KR')} 원`;

    };


    // =========================================================
    // 상태 배지
    // =========================================================

    const getStatusBadge = (status) => {

        const statusMap = {

            R: '검토중',

            A: '승인됨',

            J: '반려됨',

            H: '보류됨',

            C: '취소됨'

        };


        return (

            <span
                className={`amount-status-badge status-${status}`}
            >

                {
                    statusMap[status] ||
                    status ||
                    '-'
                }

            </span>

        );

    };


    // =========================================================
    // 결재 처리 상태
    //
    // 목록에서는 실제 결재를 처리하지 않음.
    // 실제 승인 / 반려 / 보류는 상세 페이지에서 처리.
    // =========================================================

    const getApprovalStatus = (status) => {

        // -----------------------------------------------------
        // 검토중 / 보류
        // -----------------------------------------------------

        if (
            status === 'R' ||
            status === 'H'
        ) {

            return (

                <span className="text-pending">

                    미처리

                </span>

            );

        }


        // -----------------------------------------------------
        // 신청자 취소
        // -----------------------------------------------------

        if (status === 'C') {

            return (

                <span className="text-disabled">

                    신청자 취소

                </span>

            );

        }


        // -----------------------------------------------------
        // 승인 / 반려
        // -----------------------------------------------------

        if (
            status === 'A' ||
            status === 'J'
        ) {

            return (

                <span className="text-disabled">

                    처리완료

                </span>

            );

        }


        // -----------------------------------------------------
        // 기타 상태
        // -----------------------------------------------------

        return (

            <span className="text-disabled">

                -

            </span>

        );

    };


    // =========================================================
    // 로딩 화면
    // =========================================================

    if (loading) {

        console.log(
            '⏳ 관리자 비용 목록 로딩 중'
        );


        return (

            <div className="amount-container">

                <div
                    style={{
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >

                    정산 신청 목록을
                    불러오는 중입니다...

                </div>

            </div>

        );

    }


    // =========================================================
    // 화면 렌더링
    // =========================================================

    console.log(
        '🔥🔥 화면 렌더링 amounts:',
        amounts
    );


    console.log(
        '🔥🔥 amounts length:',
        amounts.length
    );


    return (

        <main className="amount-container">


            {/* =================================================
                제목 영역
            ================================================= */}

            <section className="wf-page-header">

                <div>

                    <h1 className="wf-page-title">

                        비용 정산 관리

                    </h1>


                    <p className="wf-page-description">

                        전사 비용 정산 신청을 검토하고
                        상세 페이지에서 결재 처리합니다.

                    </p>

                </div>


                <div className="wf-page-actions">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate(
                                '/admin/statistics'
                            )
                        }
                    >

                        정산 통계 보기

                    </button>

                </div>

            </section>


            {/* =================================================
                비용 목록 테이블
            ================================================= */}

            <table className="amount-table">

                <thead>

                    <tr className="admin-table-header">

                        <th className="text-center">

                            신청번호

                        </th>


                        <th className="text-center">

                            사원명

                        </th>


                        <th className="text-right">

                            신청 금액

                        </th>


                        <th className="text-right">

                            승인 금액

                        </th>


                        <th className="text-center">

                            상태

                        </th>


                        <th className="text-center">

                            신청일

                        </th>


                        <th className="text-center">

                            결재 처리

                        </th>

                    </tr>

                </thead>


                <tbody>

                    {
                        amounts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="text-center"
                                >

                                    정산 신청 내역이 없습니다.

                                </td>

                            </tr>

                        ) : (

                            amounts.map((item) => (

                                <tr
                                    key={item.amountNo}
                                    onClick={() =>
                                        navigate(
                                            `/cost/detail/${item.amountNo}`
                                        )
                                    }
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                >

                                    {/* =================================
                                        신청번호
                                    ================================= */}

                                    <td className="text-center">

                                        {item.amountNo}

                                    </td>


                                    {/* =================================
                                        사원명
                                    ================================= */}

                                    <td className="text-center">

                                        {
                                            item.empName ||
                                            '-'
                                        }

                                    </td>


                                    {/* =================================
                                        신청 금액
                                    ================================= */}

                                    <td className="text-right">

                                        {
                                            formatMoney(
                                                item.requestedAmount
                                            )
                                        }

                                    </td>


                                    {/* =================================
                                        승인 금액
                                    ================================= */}

                                    <td className="text-right">

                                        {
                                            item.approvedAmount !== null &&
                                            item.approvedAmount !== undefined

                                                ? formatMoney(
                                                    item.approvedAmount
                                                )

                                                : '-'
                                        }

                                    </td>


                                    {/* =================================
                                        상태
                                    ================================= */}

                                    <td className="text-center">

                                        {
                                            getStatusBadge(
                                                item.status
                                            )
                                        }

                                    </td>


                                    {/* =================================
                                        신청일
                                    ================================= */}

                                    <td className="text-center">

                                        {
                                            formatDate(
                                                item.requestedAt
                                            )
                                        }

                                    </td>


                                    {/* =================================
                                        결재 처리
                                    ================================= */}

                                    <td className="text-center">

                                        {
                                            getApprovalStatus(
                                                item.status
                                            )
                                        }

                                    </td>

                                </tr>

                            ))

                        )
                    }

                </tbody>

            </table>


            {/* =================================================
                페이징
            ================================================= */}

            {
                pageInfo.maxPage > 0 && (

                    <div className="pagination">


                        {/* =========================================
                            이전
                        ========================================= */}

                        <button
                            type="button"
                            disabled={
                                pageInfo.currentPage <= 1
                            }
                            onClick={() =>
                                handlePageChange(
                                    pageInfo.currentPage - 1
                                )
                            }
                        >

                            이전

                        </button>


                        {/* =========================================
                            페이지 번호
                        ========================================= */}

                        {
                            Array.from(

                                {
                                    length:
                                        Math.max(
                                            0,
                                            pageInfo.endPage -
                                            pageInfo.startPage +
                                            1
                                        )
                                },

                                (_, index) => {

                                    const pageNumber =
                                        pageInfo.startPage +
                                        index;


                                    return (

                                        <button
                                            type="button"
                                            key={pageNumber}
                                            className={
                                                pageNumber ===
                                                pageInfo.currentPage
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    pageNumber
                                                )
                                            }
                                        >

                                            {pageNumber}

                                        </button>

                                    );

                                }

                            )
                        }


                        {/* =========================================
                            다음
                        ========================================= */}

                        <button
                            type="button"
                            disabled={
                                pageInfo.currentPage >=
                                pageInfo.maxPage
                            }
                            onClick={() =>
                                handlePageChange(
                                    pageInfo.currentPage + 1
                                )
                            }
                        >

                            다음

                        </button>

                    </div>

                )

            }

        </main>

    );

}