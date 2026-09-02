import React, { useEffect, useState } from "react";
import { amountApi } from "../../Amount/api/amountApi";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import "../../Amount/styles/Statistics.css";


export default function Statistics() {

    // =========================================================
    // 상태
    // =========================================================

    const [summary, setSummary] = useState({
        totalCount: 0,
        totalRequestedAmount: 0,
        totalApprovedAmount: 0,
        reviewCount: 0,
        approvedCount: 0,
        holdCount: 0,
        rejectedCount: 0,
        cancelledCount: 0
    });

    const [deptStatistics, setDeptStatistics] = useState([]);

    const [monthlyStatistics, setMonthlyStatistics] = useState([]);

    const [itemStatistics, setItemStatistics] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // 비용 항목명
    // DB 기준
    //
    // S 숙박
    // T 교통
    // E 체험
    // F 식비
    // V 차량
    // O 기타
    // =========================================================

    const itemTypeMap = {
        S: "숙박",
        T: "교통",
        E: "체험",
        F: "식비",
        V: "차량",
        O: "기타"
    };


    // =========================================================
    // 금액 포맷
    // =========================================================

    const formatAmount = (value) => {

        const number = Number(value);

        if (isNaN(number)) {
            return "0원";
        }

        return number.toLocaleString("ko-KR") + "원";
    };


    // =========================================================
    // 숫자 변환
    // =========================================================

    const toNumber = (value) => {

        const number = Number(value);

        return isNaN(number) ? 0 : number;
    };


    // =========================================================
    // 통계 조회
    // =========================================================

    const fetchStatistics = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await amountApi.getStatistics();

            console.log("통계 응답:", response);

            /*
             * 백엔드 응답 구조
             *
             * {
             *   summary: {...},
             *   deptStatistics: [...],
             *   monthlyStatistics: [...],
             *   itemStatistics: [...]
             * }
             */

            const data = response?.data ?? response;

            console.log("통계 data:", data);


            // =====================================================
            // Summary
            // =====================================================

            const summaryData =
                data?.summary ??
                data?.statisticsSummary ??
                {};

            /*
             * 현재 백엔드 Mapper의 getStatisticsSummary()
             *
             * totalApproved
             * avgApproved
             *
             * 를 사용
             *
             * 전체 건수 / 신청금액 / 상태별 건수는
             * 별도 SQL이 없으면 계산할 수 없으므로
             * 기본값 0으로 처리
             */

            setSummary({

                totalCount:
                    toNumber(
                        summaryData.totalCount ??
                        summaryData.TOTALCOUNT
                    ),

                totalRequestedAmount:
                    toNumber(
                        summaryData.totalRequestedAmount ??
                        summaryData.TOTALREQUESTEDAMOUNT
                    ),

                totalApprovedAmount:
                    toNumber(
                        summaryData.totalApprovedAmount ??
                        summaryData.totalApproved ??
                        summaryData.TOTALAPPROVED
                    ),

                reviewCount:
                    toNumber(
                        summaryData.reviewCount ??
                        summaryData.REVIEWCOUNT
                    ),

                approvedCount:
                    toNumber(
                        summaryData.approvedCount ??
                        summaryData.APPROVEDCOUNT
                    ),

                holdCount:
                    toNumber(
                        summaryData.holdCount ??
                        summaryData.HOLDCOUNT
                    ),

                rejectedCount:
                    toNumber(
                        summaryData.rejectedCount ??
                        summaryData.REJECTEDCOUNT
                    ),

                cancelledCount:
                    toNumber(
                        summaryData.cancelledCount ??
                        summaryData.CANCELLEDCOUNT
                    )

            });


            // =====================================================
            // 부서별 통계
            //
            // 백엔드:
            //
            // dep_id
            // dep_title
            // amount
            // =====================================================

            const deptData =
                data?.deptStatistics ??
                data?.departmentStatistics ??
                [];

            setDeptStatistics(

                Array.isArray(deptData)

                    ? deptData.map((item) => ({

                        depId:
                            item.depId ??
                            item.DEP_ID ??
                            item.dep_id,

                        depTitle:
                            item.depTitle ??
                            item.DEP_TITLE ??
                            item.dep_title ??
                            "미지정",

                        /*
                         * 현재 SQL에는 amountCount가 없음
                         */
                        amountCount:
                            toNumber(
                                item.amountCount ??
                                item.AMOUNTCOUNT ??
                                item.amount_count
                            ),

                        /*
                         * 현재 SQL에는 requestedAmount가 없음
                         */
                        requestedAmount:
                            toNumber(
                                item.requestedAmount ??
                                item.REQUESTEDAMOUNT ??
                                item.requested_amount
                            ),

                        /*
                         * 현재 SQL의 amount
                         * = 승인된 금액
                         */
                        approvedAmount:
                            toNumber(
                                item.approvedAmount ??
                                item.APPROVEDAMOUNT ??
                                item.approved_amount ??
                                item.amount ??
                                item.AMOUNT
                            )

                    }))

                    : []

            );


            // =====================================================
            // 월별 통계
            //
            // 백엔드:
            //
            // month
            // amount
            //
            // amount = 승인된 금액
            // =====================================================

            const monthlyData =
                data?.monthlyStatistics ??
                data?.monthly ??
                [];

            setMonthlyStatistics(

                Array.isArray(monthlyData)

                    ? monthlyData.map((item) => ({

                        month:
                            item.month ??
                            item.MONTH ??
                            "",

                        /*
                         * 현재 SQL에는 amountCount 없음
                         */
                        amountCount:
                            toNumber(
                                item.amountCount ??
                                item.AMOUNTCOUNT
                            ),

                        /*
                         * 현재 SQL에는 requestedAmount 없음
                         */
                        requestedAmount:
                            toNumber(
                                item.requestedAmount ??
                                item.REQUESTEDAMOUNT
                            ),

                        /*
                         * 현재 SQL의 amount
                         * = 승인된 금액
                         */
                        approvedAmount:
                            toNumber(
                                item.approvedAmount ??
                                item.APPROVEDAMOUNT ??
                                item.amount ??
                                item.AMOUNT
                            )

                    }))

                    : []

            );


            // =====================================================
            // 비용 항목별 통계
            //
            // 백엔드:
            //
            // item_type
            // amount
            //
            // amount = 승인된 비용 금액
            // =====================================================

            const itemData =
                data?.itemStatistics ??
                data?.items ??
                [];

            console.log("항목 통계 원본:", itemData);

            setItemStatistics(

                Array.isArray(itemData)

                    ? itemData.map((item) => ({

                        itemType:
                            item.itemType ??
                            item.ITEMTYPE ??
                            item.item_type ??
                            item.ITEM_TYPE,

                        /*
                         * 현재 SQL에는 itemCount 없음
                         */
                        itemCount:
                            toNumber(
                                item.itemCount ??
                                item.ITEMCOUNT ??
                                item.item_count
                            ),

                        /*
                         * 현재 SQL의 amount
                         * = 승인된 비용
                         */
                        totalAmount:
                            toNumber(
                                item.totalAmount ??
                                item.TOTALAMOUNT ??
                                item.total_amount ??
                                item.amount ??
                                item.AMOUNT
                            ),

                        /*
                         * Pie / 지급액 표시용
                         */
                        approvedAmount:
                            toNumber(
                                item.approvedAmount ??
                                item.APPROVEDAMOUNT ??
                                item.approved_amount ??
                                item.amount ??
                                item.AMOUNT
                            )

                    }))

                    : []

            );

        } catch (err) {

            console.error("통계 조회 실패:", err);

            console.error(
                "서버 응답:",
                err?.response?.data
            );

            setError(
                err?.response?.data?.message ||
                "통계 데이터를 불러오지 못했습니다."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // 최초 실행
    // =========================================================

    useEffect(() => {

        fetchStatistics();

    }, []);


    // =========================================================
    // 비용 항목 Pie 데이터
    //
    // 승인된 비용 금액 기준
    // =========================================================

    const pieData = itemStatistics

        .filter(
            (item) =>
                item.approvedAmount > 0
        )

        .map((item) => ({

            name:
                itemTypeMap[item.itemType] ||
                item.itemType ||
                "기타",

            value:
                item.approvedAmount

        }));


    // =========================================================
    // Pie 전체 금액
    // =========================================================

    const pieTotal = pieData.reduce(

        (sum, item) =>
            sum + item.value,

        0

    );


    // =========================================================
    // Pie 퍼센트
    // =========================================================

    const renderPieLabel = ({
        name,
        percent
    }) => {

        if (!percent) {
            return "";
        }

        return `${name} ${(percent * 100).toFixed(1)}%`;
    };


    // =========================================================
    // Pie 색상
    // =========================================================

    const pieColors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff8042",
        "#0088FE",
        "#00C49F"
    ];


    // =========================================================
    // 로딩
    // =========================================================

    if (loading) {

        return (

            <div className="statistics-container">

                <div className="statistics-loading">
                    통계 데이터를 불러오는 중입니다...
                </div>

            </div>

        );
    }


    // =========================================================
    // 에러
    // =========================================================

    if (error) {

        return (

            <div className="statistics-container">

                <div className="statistics-error">

                    <h3>
                        통계 조회 실패
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchStatistics}
                    >
                        다시 조회
                    </button>

                </div>

            </div>

        );
    }


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="statistics-container">


            {/* =================================================
                제목
                ================================================= */}

            <div className="statistics-header">

                <h2>
                    비용 통계
                </h2>

                <button
                    className="refresh-button"
                    onClick={fetchStatistics}
                >
                    새로고침
                </button>

            </div>


            {/* =================================================
                요약 카드
                ================================================= */}

            <div className="summary-grid">


                {/* 전체 신청 */}

                <div className="summary-card">

                    <div className="summary-title">
                        전체 신청
                    </div>

                    <div className="summary-value">
                        {summary.totalCount.toLocaleString()}건
                    </div>

                </div>


                {/* 총 신청 금액 */}

                <div className="summary-card">

                    <div className="summary-title">
                        총 신청 금액
                    </div>

                    <div className="summary-value">
                        {formatAmount(
                            summary.totalRequestedAmount
                        )}
                    </div>

                </div>


                {/* 총 지급액 */}

                <div className="summary-card">

                    <div className="summary-title">
                        총 지급액
                    </div>

                    <div className="summary-value">
                        {formatAmount(
                            summary.totalApprovedAmount
                        )}
                    </div>

                    <div className="summary-description">
                        승인된 비용만 포함
                    </div>

                </div>


                {/* 승인 */}

                <div className="summary-card">

                    <div className="summary-title">
                        승인
                    </div>

                    <div className="summary-value">
                        {summary.approvedCount.toLocaleString()}건
                    </div>

                </div>


                {/* 검토 */}

                <div className="summary-card">

                    <div className="summary-title">
                        검토
                    </div>

                    <div className="summary-value">
                        {summary.reviewCount.toLocaleString()}건
                    </div>

                </div>


                {/* 보류 */}

                <div className="summary-card">

                    <div className="summary-title">
                        보류
                    </div>

                    <div className="summary-value">
                        {summary.holdCount.toLocaleString()}건
                    </div>

                </div>


                {/* 반려 */}

                <div className="summary-card">

                    <div className="summary-title">
                        반려
                    </div>

                    <div className="summary-value">
                        {summary.rejectedCount.toLocaleString()}건
                    </div>

                </div>


                {/* 취소 */}

                <div className="summary-card">

                    <div className="summary-title">
                        취소
                    </div>

                    <div className="summary-value">
                        {summary.cancelledCount.toLocaleString()}건
                    </div>

                </div>

            </div>


            {/* =================================================
                차트 영역
                ================================================= */}

            <div className="statistics-chart-grid">


                {/* =================================================
                    비용 항목별 비율
                    ================================================= */}

                <div className="statistics-card">

                    <div className="statistics-card-header">

                        <h3>
                            비용 항목별 비율
                        </h3>

                    </div>


                    {pieData.length === 0 ? (

                        <div className="empty-chart">
                            데이터가 없습니다.
                        </div>

                    ) : (

                        <div
                            className="pie-chart-wrapper"
                            style={{
                                width: "100%",
                                height: 380
                            }}
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={115}
                                        label={renderPieLabel}
                                        labelLine={true}
                                    >

                                        {pieData.map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        pieColors[
                                                            index %
                                                            pieColors.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>


                                    <Tooltip
                                        formatter={(value) => [
                                            formatAmount(value),
                                            "승인 금액"
                                        ]}
                                    />


                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </div>


                {/* =================================================
                    월별 비용 현황
                    ================================================= */}

                <div className="statistics-card">

                    <div className="statistics-card-header">

                        <h3>
                            월별 비용 현황
                        </h3>

                    </div>


                    {monthlyStatistics.length === 0 ? (

                        <div className="empty-chart">
                            데이터가 없습니다.
                        </div>

                    ) : (

                        <div
                            style={{
                                width: "100%",
                                height: 380
                            }}
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={monthlyStatistics}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 20,
                                        bottom: 20
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />


                                    <XAxis
                                        dataKey="month"
                                    />


                                    <YAxis
                                        tickFormatter={(value) =>
                                            Number(value).toLocaleString()
                                        }
                                    />


                                    <Tooltip
                                        formatter={(value) =>
                                            formatAmount(value)
                                        }
                                    />


                                    <Legend />


                                    <Bar
                                        dataKey="approvedAmount"
                                        name="지급액"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                부서별 통계
                ================================================= */}

            <div className="statistics-card department-statistics">

                <div className="statistics-card-header">

                    <h3>
                        부서별 비용 현황
                    </h3>

                </div>


                {deptStatistics.length === 0 ? (

                    <div className="empty-data">
                        데이터가 없습니다.
                    </div>

                ) : (

                    <div className="statistics-table-wrapper">

                        <table className="statistics-table">

                            <thead>

                                <tr>

                                    <th>
                                        부서
                                    </th>

                                    <th>
                                        지급액
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {deptStatistics.map(
                                    (item, index) => (

                                        <tr
                                            key={
                                                item.depId ??
                                                index
                                            }
                                        >

                                            <td>
                                                {item.depTitle}
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    item.approvedAmount
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                비용 항목 상세
                ================================================= */}

            <div className="statistics-card item-statistics">

                <div className="statistics-card-header">

                    <h3>
                        비용 항목별 현황
                    </h3>

                </div>


                {itemStatistics.length === 0 ? (

                    <div className="empty-data">
                        데이터가 없습니다.
                    </div>

                ) : (

                    <div className="statistics-table-wrapper">

                        <table className="statistics-table">

                            <thead>

                                <tr>

                                    <th>
                                        항목
                                    </th>

                                    <th>
                                        지급액
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {itemStatistics.map(
                                    (item, index) => (

                                        <tr
                                            key={
                                                item.itemType ??
                                                index
                                            }
                                        >

                                            <td>
                                                {
                                                    itemTypeMap[
                                                        item.itemType
                                                    ] ||
                                                    item.itemType ||
                                                    "기타"
                                                }
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    item.approvedAmount
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


        </div>

    );
}

