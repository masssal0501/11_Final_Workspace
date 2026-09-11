import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { amountApi } from "../api/amountApi";


export default function AmountList({ workcationNo }) {

    const navigate = useNavigate();

    const [amounts, setAmounts] = useState([]);
    const [loading, setLoading] = useState(true);


    // =========================================================
    // 해당 워케이션의 비용 정산 신청 목록 조회
    //
    // Amount
    // ---------------------------------------------------------
    // amountNo
    // requestedAt
    // status
    // workcationNo
    // itemList
    //
    // AmountItem
    // ---------------------------------------------------------
    // itemAmount
    // itemApprovedAmount
    // =========================================================

    const fetchAmountList = useCallback(async () => {

        // -------------------------------------------------------
        // workcationNo가 없는 경우
        // -------------------------------------------------------

        if (
            workcationNo === null ||
            workcationNo === undefined ||
            workcationNo === ""
        ) {

            console.log("⚠️ workcationNo가 없습니다.");

            setAmounts([]);
            setLoading(false);

            return;
        }


        // -------------------------------------------------------
        // 숫자 변환
        // -------------------------------------------------------

        const no = Number(workcationNo);


        if (Number.isNaN(no) || no <= 0) {

            console.warn(
                "⚠️ 올바르지 않은 workcationNo:",
                workcationNo
            );

            setAmounts([]);
            setLoading(false);

            return;
        }


        try {

            setLoading(true);


            console.log("=================================");
            console.log("📌 워케이션 비용 목록 조회");
            console.log("📌 workcationNo:", no);
            console.log("=================================");


            // =====================================================
            // 서버 조회
            // =====================================================

            const data =
                await amountApi.getAmountListByWorkcation(no);


            console.log(
                "📋 비용 정산 신청 목록 응답:",
                data
            );


            // =====================================================
            // 서버 응답 형태
            //
            // ① List<Amount>
            //
            // [
            //   {
            //      amountNo: 1,
            //      requestedAt: "...",
            //      status: "R",
            //      workcationNo: 1,
            //      itemList: [
            //          {
            //              itemNo: 1,
            //              itemType: "S",
            //              itemAmount: 400000,
            //              itemApprovedAmount: 300000
            //          }
            //      ]
            //   }
            // ]
            //
            // ② PageInfo
            //
            // {
            //      list: [...]
            // }
            // =====================================================

            let list = [];


            if (Array.isArray(data)) {

                list = data;

            } else if (Array.isArray(data?.list)) {

                list = data.list;

            }


            // =====================================================
            // amountNo가 존재하는 정상 데이터만 저장
            // =====================================================

            const validList =
                list.filter(
                    (item) =>
                        item &&
                        item.amountNo !== null &&
                        item.amountNo !== undefined
                );


            console.log(
                "📋 현재 워케이션 비용 목록:",
                validList
            );


            setAmounts(validList);


        } catch (error) {

            console.error(
                "❌ 비용 정산 신청 목록 조회 실패:",
                error
            );

            console.error(
                "❌ 상태 코드:",
                error.response?.status
            );

            console.error(
                "❌ 서버 응답:",
                error.response?.data
            );


            setAmounts([]);

        } finally {

            setLoading(false);

        }

    }, [workcationNo]);


    // =========================================================
    // workcationNo 변경 시 다시 조회
    // =========================================================

    useEffect(() => {

        fetchAmountList();

    }, [fetchAmountList]);


    // =========================================================
    // Amount.status 상태명
    //
    // A : 승인
    // C : 취소
    // H : 보류
    // J : 반려
    // R : 검토
    // =========================================================

    const getStatusText = (status) => {

        const statusMap = {

            // BUG-NEW: 공식 상태값에는 없는 'W'(구버전 코드가 남긴 데이터)가 일부
            // 기존 신청 건에 남아 있어 방어적으로 매핑을 추가한다.
            W: "대기",
            A: "승인됨",
            C: "취소됨",
            H: "보류됨",
            J: "반려됨",
            R: "검토중"

        };


        return (
            statusMap[status] ||
            status ||
            "-"
        );

    };


    // =========================================================
    // 상태 CSS
    // =========================================================

    const getStatusClass = (status) => {

        return status
            ? `status-${status}`
            : "status-UNKNOWN";

    };


    // =========================================================
    // 날짜 포맷
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }


        const d = new Date(date);


        if (Number.isNaN(d.getTime())) {

            return "-";

        }


        const year =
            d.getFullYear();

        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                d.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    };


    // =========================================================
    // 금액 포맷
    // =========================================================

    const formatMoney = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "-";

        }


        const number =
            Number(value);


        if (Number.isNaN(number)) {

            return "-";

        }


        return (
            `${number.toLocaleString("ko-KR")} 원`
        );

    };


    // =========================================================
    // 신청 금액 합계
    //
    // DB
    // amount_item.amount
    //
    // JPA Entity
    // AmountItem.itemAmount
    //
    // itemList의 모든 itemAmount 합계
    // =========================================================

    const getRequestedAmount = (item) => {

        if (!Array.isArray(item?.itemList)) {

            return 0;

        }


        return item.itemList.reduce(
            (total, detailItem) => {

                return (
                    total +
                    (
                        Number(
                            detailItem?.itemAmount
                        ) || 0
                    )
                );

            },
            0
        );

    };


    // =========================================================
    // 회사 지원금 합계
    //
    // DB
    // amount_item.item_approved_amount
    //
    // JPA Entity
    // AmountItem.itemApprovedAmount
    //
    // =========================================================

    const getCompanySupportAmount = (item) => {

        if (!Array.isArray(item?.itemList)) {

            return 0;

        }


        return item.itemList.reduce(
            (total, detailItem) => {

                return (
                    total +
                    (
                        Number(
                            detailItem?.itemApprovedAmount
                        ) || 0
                    )
                );

            },
            0
        );

    };


    // =========================================================
    // 상세 페이지 이동
    // =========================================================

    const handleDetail = (amountNo) => {

        if (
            amountNo === null ||
            amountNo === undefined ||
            amountNo === ""
        ) {

            alert(
                "비용 신청 번호가 없습니다."
            );

            return;

        }


        console.log(
            "📌 비용 상세 이동:",
            amountNo
        );


        navigate(
            `/cost/detail/${amountNo}`
        );

    };


    // =========================================================
    // 로딩
    // =========================================================

    if (loading) {

        return (

            <div className="amount-container">

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center"
                    }}
                >
                    비용 정산 신청 내역을
                    불러오는 중입니다...
                </div>

            </div>

        );

    }


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="amount-container">


            {/* =================================================
                제목
            ================================================== */}

            <h2 className="amount-title">

                워케이션 비용 정산 신청 내역

            </h2>


            {/* =================================================
                워케이션 번호
            ================================================== */}

            <div
                style={{
                    marginBottom: "15px",
                    fontSize: "14px",
                    color: "#666"
                }}
            >

                워케이션 번호 :

                <strong
                    style={{
                        marginLeft: "5px"
                    }}
                >

                    {workcationNo || "-"}

                </strong>

            </div>


            {/* =================================================
                비용 신청 목록
            ================================================== */}

            <table className="amount-table">

                <thead>

                    <tr>

                        <th className="text-center">
                            신청번호
                        </th>

                        <th className="text-right">
                            신청 금액
                        </th>

                        <th className="text-right">
                            회사 지원금
                        </th>

                        <th className="text-center">
                            상태
                        </th>

                        <th className="text-center">
                            신청일
                        </th>

                        <th className="text-center">
                            상세
                        </th>

                    </tr>

                </thead>


                <tbody>


                    {/* =========================================
                        데이터 없음
                    ========================================== */}

                    {amounts.length === 0 ? (

                        <tr>

                            <td
                                colSpan="6"
                                className="text-center"
                            >

                                신청 내역이 없습니다.

                            </td>

                        </tr>

                    ) : (

                        amounts.map((item) => {

                            // ------------------------------------
                            // 신청 금액
                            // ------------------------------------

                            const requestedAmount =
                                getRequestedAmount(item);


                            // ------------------------------------
                            // 회사 지원금
                            // ------------------------------------

                            const companySupportAmount =
                                getCompanySupportAmount(item);


                            return (

                                <tr
                                    key={item.amountNo}
                                    onClick={() =>
                                        handleDetail(
                                            item.amountNo
                                        )
                                    }
                                    style={{
                                        cursor: "pointer"
                                    }}
                                >


                                    {/* =================================
                                        신청번호
                                    ================================== */}

                                    <td className="text-center">

                                        {item.amountNo}

                                    </td>


                                    {/* =================================
                                        신청 금액
                                    ================================== */}

                                    <td className="text-right">

                                        {formatMoney(
                                            requestedAmount
                                        )}

                                    </td>


                                    {/* =================================
                                        회사 지원금
                                    ================================== */}

                                    <td className="text-right">

                                        {formatMoney(
                                            companySupportAmount
                                        )}

                                    </td>


                                    {/* =================================
                                        상태
                                    ================================== */}

                                    <td className="text-center">

                                        <span
                                            className={
                                                `amount-status-badge ${
                                                    getStatusClass(
                                                        item.status
                                                    )
                                                }`
                                            }
                                        >

                                            {getStatusText(
                                                item.status
                                            )}

                                        </span>

                                    </td>


                                    {/* =================================
                                        신청일
                                    ================================== */}

                                    <td className="text-center">

                                        {formatDate(
                                            item.requestedAt
                                        )}

                                    </td>


                                    {/* =================================
                                        상세
                                    ================================== */}

                                    <td className="text-center">

                                        <button
                                            type="button"
                                            className="btn btn-secondary"

                                            onClick={(e) => {

                                                e.stopPropagation();

                                                handleDetail(
                                                    item.amountNo
                                                );

                                            }}
                                        >

                                            상세보기

                                        </button>

                                    </td>


                                </tr>

                            );

                        })

                    )}

                </tbody>

            </table>

        </div>

    );

}

