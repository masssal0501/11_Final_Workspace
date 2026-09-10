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


// =========================================================
// 비용 항목 코드
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
// 차트 색상
// =========================================================
const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F"
];


// =========================================================
// 숫자 변환
// =========================================================
const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const number = Number(value);

    return Number.isNaN(number) ? 0 : number;
};


// =========================================================
// 금액 포맷
// =========================================================
const formatAmount = (value) => {
    return `${toNumber(value).toLocaleString("ko-KR")}원`;
};


// =========================================================
// 날짜 포맷
// =========================================================
const formatMonth = (value) => {
    if (!value) {
        return "";
    }

    const text = String(value);

    // YYYY-MM 형태
    if (/^\d{4}-\d{2}$/.test(text)) {
        return text;
    }

    // YYYY-MM-DD 형태
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return text.substring(0, 7);
    }

    return text;
};


export default function Statistics() {

    // =========================================================
    // 상태
    // =========================================================

    const [summary, setSummary] = useState({
        totalCount: 0,

        // 전체 신청금액
        totalRequestedAmount: 0,

        // 전체 회사 지원금
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
    // 통계 조회
    // =========================================================

    const fetchStatistics = async () => {

        try {

            setLoading(true);
            setError("");

            console.log("통계 조회 시작");


            const response = await amountApi.getStatistics();

            console.log("통계 API 응답:", response);


            const data = response?.data ?? response;

            console.log("통계 데이터:", data);


            // =====================================================
            // 1. 요약 통계
            // =====================================================

            const summaryData =
                data?.summary ??
                data?.statisticsSummary ??
                data?.SUMMARY ??
                data?.STATISTICS_SUMMARY ??
                {};


            console.log("요약 통계:", summaryData);


            setSummary({

                // 전체 신청 건수
                totalCount: toNumber(
                    summaryData.totalCount ??
                    summaryData.TOTALCOUNT ??
                    summaryData.total_count ??
                    summaryData.count ??
                    summaryData.COUNT
                ),


                // =================================================
                // 전체 신청금액
                //
                // 새로운 구조:
                // amount_item.amount
                // =================================================
                totalRequestedAmount: toNumber(
                    summaryData.totalRequestedAmount ??
                    summaryData.TOTALREQUESTEDAMOUNT ??
                    summaryData.total_requested_amount ??
                    summaryData.totalRequested ??
                    summaryData.TOTALREQUESTED
                ),


                // =================================================
                // 전체 회사 지원금
                //
                // 새로운 구조:
                // amount_item.item_approved_amount
                // =================================================
                totalApprovedAmount: toNumber(
                    summaryData.totalApprovedAmount ??
                    summaryData.TOTALAPPROVEDAMOUNT ??
                    summaryData.total_approved_amount ??
                    summaryData.totalApproved ??
                    summaryData.TOTALAPPROVED
                ),


                // 검토
                reviewCount: toNumber(
                    summaryData.reviewCount ??
                    summaryData.REVIEWCOUNT ??
                    summaryData.review_count ??
                    summaryData.review ??
                    summaryData.REVIEW
                ),


                // 승인
                approvedCount: toNumber(
                    summaryData.approvedCount ??
                    summaryData.APPROVEDCOUNT ??
                    summaryData.approved_count ??
                    summaryData.approved ??
                    summaryData.APPROVED
                ),


                // 보류
                holdCount: toNumber(
                    summaryData.holdCount ??
                    summaryData.HOLDCOUNT ??
                    summaryData.hold_count ??
                    summaryData.hold ??
                    summaryData.HOLD
                ),


                // 반려
                rejectedCount: toNumber(
                    summaryData.rejectedCount ??
                    summaryData.REJECTEDCOUNT ??
                    summaryData.rejected_count ??
                    summaryData.rejected ??
                    summaryData.REJECTED
                ),


                // 취소
                cancelledCount: toNumber(
                    summaryData.cancelledCount ??
                    summaryData.CANCELLEDCOUNT ??
                    summaryData.cancelled_count ??
                    summaryData.cancelled ??
                    summaryData.CANCELLED
                )
            });


            // =====================================================
            // 2. 부서별 통계
            // =====================================================

            const deptData =
                data?.deptStatistics ??
                data?.departmentStatistics ??
                data?.departments ??
                data?.DEPTSTATISTICS ??
                data?.DEPARTMENTSTATISTICS ??
                [];


            console.log("부서별 통계:", deptData);


            setDeptStatistics(
                Array.isArray(deptData)
                    ? deptData.map((dept) => ({

                        departmentName:
                            dept.departmentName ??
                            dept.DEPARTMENTNAME ??
                            dept.department_name ??
                            dept.depTitle ??
                            dept.DEP_TITLE ??
                            "",

                        approvedAmount: toNumber(
                            dept.approvedAmount ??
                            dept.APPROVEDAMOUNT ??
                            dept.approved_amount ??
                            dept.totalAmount ??
                            dept.TOTALAMOUNT ??
                            dept.amount ??
                            dept.AMOUNT
                        )

                    }))
                    : []
            );


            // =====================================================
            // 3. 월별 통계
            // =====================================================

            const monthlyData =
                data?.monthlyStatistics ??
                data?.monthly ??
                data?.monthlyData ??
                data?.MONTHLYSTATISTICS ??
                data?.MONTHLY ??
                data?.MONTHLYDATA ??
                [];


            console.log("월별 통계:", monthlyData);


            setMonthlyStatistics(
                Array.isArray(monthlyData)
                    ? monthlyData.map((item) => ({

                        month: formatMonth(
                            item.month ??
                            item.MONTH ??
                            item.monthValue ??
                            item.MONTHVALUE ??
                            item.approvedMonth ??
                            item.APPROVEDMONTH
                        ),

                        approvedAmount: toNumber(
                            item.approvedAmount ??
                            item.APPROVEDAMOUNT ??
                            item.approved_amount ??
                            item.totalAmount ??
                            item.TOTALAMOUNT ??
                            item.amount ??
                            item.AMOUNT
                        )

                    }))
                    : []
            );


            // =====================================================
            // 4. 항목별 통계
            //
            // 새로운 구조
            //
            // amount_item.amount
            //      ↓
            // 신청금액
            //
            // amount_item.item_approved_amount
            //      ↓
            // 회사 지원금
            // =====================================================

            const itemData =
                data?.itemStatistics ??
                data?.items ??
                data?.itemData ??
                data?.ITEMSTATISTICS ??
                data?.ITEMS ??
                data?.ITEMDATA ??
                [];


            console.log("항목별 통계 원본:", itemData);


            setItemStatistics(
                Array.isArray(itemData)
                    ? itemData.map((item) => ({

                        // -----------------------------------------
                        // 항목 코드
                        // -----------------------------------------
                        itemType:
                            item.amountamountitemType ??
                            item.AMOUNTAMOUNTITEMTYPE ??
                            item.amountamountitem_type ??
                            item.AMOUNTAMOUNTITEM_TYPE ??
                            item.itemType ??
                            item.ITEMTYPE ??
                            item.item_type ??
                            item.ITEM_TYPE ??
                            "",


                        // -----------------------------------------
                        // 항목 개수
                        // -----------------------------------------
                        itemCount: toNumber(
                            item.itemCount ??
                            item.ITEMCOUNT ??
                            item.item_count ??
                            item.count ??
                            item.COUNT
                        ),


                        // -----------------------------------------
                        // 신청금액
                        //
                        // DB:
                        // amount_item.amount
                        // -----------------------------------------
                        requestedAmount: toNumber(
                            item.requestedAmount ??
                            item.REQUESTEDAMOUNT ??
                            item.requested_amount ??
                            item.amount ??
                            item.AMOUNT
                        ),


                        // -----------------------------------------
                        // 회사 지원금
                        //
                        // DB:
                        // amount_item.item_approved_amount
                        // -----------------------------------------
                        approvedAmount: toNumber(
                            item.approvedAmount ??
                            item.APPROVEDAMOUNT ??
                            item.approved_amount ??
                            item.itemApprovedAmount ??
                            item.ITEMAPPROVEDAMOUNT ??
                            item.item_approved_amount ??
                            item.ITEM_APPROVED_AMOUNT
                        )

                    }))
                    : []
            );

        } catch (err) {

            console.error("통계 조회 실패:", err);

            setError(
                err?.response?.data?.message ??
                err?.message ??
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

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchStatistics}
                    >
                        다시 시도
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // PieChart 데이터
    //
    // 회사 지원금 기준
    // =========================================================

    const pieData = itemStatistics
        .filter((item) => item.approvedAmount > 0)
        .map((item) => ({

            name:
                itemTypeMap[item.itemType] ??
                item.itemType ??
                "기타",

            value: item.approvedAmount

        }));


    // =========================================================
    // 전체 Pie 합계
    // =========================================================

    const totalPieAmount = pieData.reduce(
        (sum, item) => sum + item.value,
        0
    );


    // =========================================================
    // 렌더링
    // =========================================================

    return (

        <div className="statistics-container">

            {/* =====================================================
                헤더
            ===================================================== */}

            <div className="statistics-header">

                <div>

                    <h2>비용 통계</h2>

                    <p>
                        전체 직원의 비용 신청 및 회사 지원금 통계입니다.
                    </p>

                </div>


                <button
                    type="button"
                    className="refresh-button"
                    onClick={fetchStatistics}
                >
                    새로고침
                </button>

            </div>


            {/* =====================================================
                요약 카드
            ===================================================== */}

            <div className="statistics-summary">

                {/* 전체 신청 */}

                <div className="summary-card">

                    <div className="summary-title">
                        전체 신청
                    </div>

                    <div className="summary-value">
                        {summary.totalCount.toLocaleString("ko-KR")}건
                    </div>

                </div>


                {/* 총 신청 금액 */}

                <div className="summary-card">

                    <div className="summary-title">
                        총 신청 금액
                    </div>

                    <div className="summary-value">
                        {formatAmount(summary.totalRequestedAmount)}
                    </div>

                </div>


                {/* 총 회사 지원금 */}

                <div className="summary-card">

                    <div className="summary-title">
                        총 지급액
                    </div>

                    <div className="summary-value">
                        {formatAmount(summary.totalApprovedAmount)}
                    </div>

                </div>


                {/* 승인 */}

                <div className="summary-card">

                    <div className="summary-title">
                        승인
                    </div>

                    <div className="summary-value">
                        {summary.approvedCount.toLocaleString("ko-KR")}건
                    </div>

                </div>


                {/* 검토 */}

                <div className="summary-card">

                    <div className="summary-title">
                        검토
                    </div>

                    <div className="summary-value">
                        {summary.reviewCount.toLocaleString("ko-KR")}건
                    </div>

                </div>


                {/* 보류 */}

                <div className="summary-card">

                    <div className="summary-title">
                        보류
                    </div>

                    <div className="summary-value">
                        {summary.holdCount.toLocaleString("ko-KR")}건
                    </div>

                </div>


                {/* 반려 */}

                <div className="summary-card">

                    <div className="summary-title">
                        반려
                    </div>

                    <div className="summary-value">
                        {summary.rejectedCount.toLocaleString("ko-KR")}건
                    </div>

                </div>


                {/* 취소 */}

                <div className="summary-card">

                    <div className="summary-title">
                        취소
                    </div>

                    <div className="summary-value">
                        {summary.cancelledCount.toLocaleString("ko-KR")}건
                    </div>

                </div>

            </div>


            {/* =====================================================
                차트 영역
            ===================================================== */}

            <div className="statistics-chart-grid">


                {/* =================================================
                    비용 항목별 비율
                ================================================= */}

                <div className="statistics-chart-card">

                    <h3>
                        비용 항목별 비율
                    </h3>

                    <p className="chart-description">
                        회사 지원금을 기준으로 표시합니다.
                    </p>


                    {pieData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <PieChart>

                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(1)}%`
                                    }
                                    labelLine={true}
                                >

                                    {pieData.map((entry, index) => (

                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[
                                                    index % COLORS.length
                                                ]
                                            }
                                        />

                                    ))}

                                </Pie>


                                <Tooltip
                                    formatter={(value) =>
                                        formatAmount(value)
                                    }
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="statistics-empty">
                            항목별 지원금 데이터가 없습니다.
                        </div>

                    )}

                </div>


                {/* =================================================
                    월별 비용 현황
                ================================================= */}

                <div className="statistics-chart-card">

                    <h3>
                        월별 비용 현황
                    </h3>

                    <p className="chart-description">
                        월별 회사 지원금 현황입니다.
                    </p>


                    {monthlyStatistics.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={350}
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
                                        `${(
                                            value / 10000
                                        ).toLocaleString("ko-KR")}만`
                                    }
                                />


                                <Tooltip
                                    formatter={(value) =>
                                        formatAmount(value)
                                    }
                                />


                                <Bar
                                    dataKey="approvedAmount"
                                    name="지급액"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="statistics-empty">
                            월별 데이터가 없습니다.
                        </div>

                    )}

                </div>

            </div>


            {/* =====================================================
                부서별 통계
            ===================================================== */}

            <div className="statistics-table-card">

                <h3>
                    부서별 비용 현황
                </h3>


                {deptStatistics.length > 0 ? (

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

                            {deptStatistics.map((dept, index) => (

                                <tr
                                    key={`${dept.departmentName}-${index}`}
                                >

                                    <td>
                                        {dept.departmentName || "-"}
                                    </td>

                                    <td>
                                        {formatAmount(
                                            dept.approvedAmount
                                        )}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                ) : (

                    <div className="statistics-empty">
                        부서별 데이터가 없습니다.
                    </div>

                )}

            </div>


            {/* =====================================================
                비용 항목별 상세 통계
            ===================================================== */}

            <div className="statistics-table-card">

                <h3>
                    비용 항목별 상세 현황
                </h3>


                {itemStatistics.length > 0 ? (

                    <table className="statistics-table">

                        <thead>

                            <tr>

                                <th>
                                    항목
                                </th>

                                <th>
                                    신청금액
                                </th>

                                <th>
                                    회사 지원금
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {itemStatistics.map((item, index) => (

                                <tr
                                    key={`${item.itemType}-${index}`}
                                >

                                    {/* 항목 */}

                                    <td>

                                        {itemTypeMap[item.itemType] ??
                                            item.itemType ??
                                            "-"}

                                    </td>


                                    {/* 신청금액 */}

                                    <td>

                                        {formatAmount(
                                            item.requestedAmount
                                        )}

                                    </td>


                                    {/* 회사 지원금 */}

                                    <td>

                                        {formatAmount(
                                            item.approvedAmount
                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                ) : (

                    <div className="statistics-empty">
                        비용 항목 데이터가 없습니다.
                    </div>

                )}

            </div>

        </div>
    );
}