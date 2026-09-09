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


            const data = await amountApi.getAmountList(currentPage);


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
            //
            // 서버 응답 예:
            //
            // {
            //     pageLimit: 5,
            //     startPage: 1,
            //     boardLimit: 10,
            //     limit: 10,
            //     page: 1,
            //     endPage: 1,
            //     maxPage: 1,
            //     listCount: 5,
            //     list: [...]
            // }
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


        // 페이지 범위 검사

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
    // 결재 처리
    // =========================================================

    const handleApproval = async (
        e,
        item,
        status
    ) => {

        // 행 클릭 이벤트 방지

        e.stopPropagation();


        let comment = '';

        let approvedAmount = 0;


        // =====================================================
        // 보류 / 반려
        // =====================================================

        if (
            status === 'H' ||
            status === 'J'
        ) {

            const reasonTitle =
                status === 'H'
                    ? '보류 사유를 입력하세요.'
                    : '반려 사유를 입력하세요.';


            const inputComment =
                window.prompt(
                    reasonTitle
                );


            // 취소

            if (
                inputComment === null
            ) {

                return;
            }


            comment =
                inputComment.trim();


            // 사유 필수

            if (!comment) {

                alert(
                    status === 'H'
                        ? '보류 사유를 입력해주세요.'
                        : '반려 사유를 입력해주세요.'
                );

                return;
            }
        }


        // =====================================================
        // 승인
        // =====================================================

        if (status === 'A') {

            const inputAmt =
                window.prompt(
                    '승인 금액을 입력하세요:',
                    item.approvedAmount ??
                    item.requestedAmount ??
                    0
                );


            // 취소

            if (
                inputAmt === null
            ) {

                return;
            }


            // 콤마 제거

            const cleanAmount =
                String(inputAmt)
                    .replace(/,/g, '')
                    .trim();


            approvedAmount =
                Number(cleanAmount);


            // 숫자 검증

            if (
                cleanAmount === '' ||
                Number.isNaN(approvedAmount) ||
                approvedAmount < 0
            ) {

                alert(
                    '올바른 금액을 입력해 주세요.'
                );

                return;
            }


            // 신청 금액

            const requestedAmount =
                Number(
                    item.requestedAmount
                ) || 0;


            // 신청 금액 초과 방지

            if (
                approvedAmount >
                requestedAmount
            ) {

                alert(
                    `승인 금액(${approvedAmount.toLocaleString()}원)은 ` +
                    `신청 금액(${requestedAmount.toLocaleString()}원)을 ` +
                    `초과할 수 없습니다.`
                );

                return;
            }
        }


        // =====================================================
        // 서버 요청
        // =====================================================

        try {

            console.log(
                '================================'
            );

            console.log(
                '===== 정산 결재 처리 ====='
            );

            console.log(
                'amountNo:',
                item.amountNo
            );

            console.log(
                'status:',
                status
            );

            console.log(
                'approvedAmount:',
                approvedAmount
            );

            console.log(
                'comment:',
                comment
            );

            console.log(
                '================================'
            );


            await amountApi.updateApproval(

                item.amountNo,

                status,

                approvedAmount,

                comment
            );


            // =================================================
            // 완료 메시지
            // =================================================

            const statusMessage = {

                A:
                    '승인 처리가 완료되었습니다.',

                H:
                    '보류 처리가 완료되었습니다.',

                J:
                    '반려 처리가 완료되었습니다.'
            };


            alert(
                statusMessage[status] ||
                '결재 처리가 완료되었습니다.'
            );


            // =================================================
            // 현재 페이지 유지하면서 다시 조회
            // =================================================

            await fetchAmountList(
                pageInfo.currentPage
            );


        } catch (error) {

            console.error(
                '❌ 결재 처리 실패:',
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


            alert(

                error.response?.data?.message ||

                error.response?.data ||

                '결재 처리에 실패했습니다.'
            );
        }
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

        <div className="amount-container">


            {/* =================================================
                제목 영역
            ================================================= */}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}
            >

                <h2
                    className="amount-title"
                    style={{
                        margin: 0
                    }}
                >
                    비용 정산 결재 관리 (관리자)
                </h2>


                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate(
                            '/admin/statistics'
                        )
                    }
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    📊 정산 통계 보기
                </button>

            </div>


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

                                    {/* 신청번호 */}

                                    <td className="text-center">

                                        {item.amountNo}

                                    </td>


                                    {/* 사원명 */}

                                    <td className="text-center">

                                        {
                                            item.empName ||
                                            '-'
                                        }

                                    </td>


                                    {/* 신청 금액 */}

                                    <td className="text-right">

                                        {
                                            formatMoney(
                                                item.requestedAmount
                                            )
                                        }

                                    </td>


                                    {/* 승인 금액 */}

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


                                    {/* 상태 */}

                                    <td className="text-center">

                                        {
                                            getStatusBadge(
                                                item.status
                                            )
                                        }

                                    </td>


                                    {/* 신청일 */}

                                    <td className="text-center">

                                        {
                                            formatDate(
                                                item.requestedAt
                                            )
                                        }

                                    </td>


                                    {/* 결재 처리 */}

                                    <td className="text-center">

                                        {
                                            ['R', 'H'].includes(
                                                item.status
                                            ) ? (

                                                <>

                                                    {/* 승인 */}

                                                    <button
                                                        type="button"
                                                        className="btn btn-approve"
                                                        onClick={(e) =>
                                                            handleApproval(
                                                                e,
                                                                item,
                                                                'A'
                                                            )
                                                        }
                                                    >
                                                        승인
                                                    </button>


                                                    {/* 반려 */}

                                                    <button
                                                        type="button"
                                                        className="btn btn-reject"
                                                        onClick={(e) =>
                                                            handleApproval(
                                                                e,
                                                                item,
                                                                'J'
                                                            )
                                                        }
                                                    >
                                                        반려
                                                    </button>


                                                    {/* 보류 */}

                                                    {
                                                        item.status === 'R' && (

                                                            <button
                                                                type="button"
                                                                className="btn btn-hold"
                                                                onClick={(e) =>
                                                                    handleApproval(
                                                                        e,
                                                                        item,
                                                                        'H'
                                                                    )
                                                                }
                                                            >
                                                                보류
                                                            </button>

                                                        )
                                                    }

                                                </>

                                            ) : (

                                                <span className="text-disabled">

                                                    {
                                                        item.status === 'C'
                                                            ? '신청자 취소건'
                                                            : '처리 완료'
                                                    }

                                                </span>

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

                        {/* 이전 */}

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


                        {/* 페이지 번호 */}

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


                        {/* 다음 */}

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

        </div>
    );
}

