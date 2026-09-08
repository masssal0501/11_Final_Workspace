import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { amountApi } from "../../amount/api/amountApi";

import "../../amount/styles/AmountStyle.css";

export default function AmountDetail() {

    const { amountNo } = useParams();
    const navigate = useNavigate();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // 회사 지원금
    //
    // amount_item.amount
    //      → 신청금액
    //
    // amount_item.item_approved_amount
    //      → 회사 지원금
    // =========================================================

    const [companySupportRows, setCompanySupportRows] = useState([]);

    // =========================================================
    // 지자체 지원금
    // =========================================================

    const [localSupport, setLocalSupport] = useState({
        sponsorName: "",
        amount: "",
        paymentDate: "",
        status: "UNPAID",
        remark: "",
        itemNo: ""
    });

    // =========================================================
    // 관리자 의견
    // =========================================================

    const [comment, setComment] = useState("");


    // =========================================================
    // 상태명
    // =========================================================

    const statusMap = {
        A: "승인",
        C: "취소",
        H: "보류",
        J: "반려",
        R: "검토중"
    };


    // =========================================================
    // 비용 항목
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

    const formatMoney = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "-";
        }

        return `${number.toLocaleString("ko-KR")}원`;
    };


    // =========================================================
    // 날짜 포맷
    // =========================================================

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("ko-KR");
    };


    // =========================================================
    // 상세 조회
    // =========================================================

    useEffect(() => {

        const loadDetail = async () => {

            try {

                setLoading(true);

                const response =
                    await amountApi.getAmountById(
                        Number(amountNo)
                    );

                const data =
                    response?.data ?? response;

                console.log(
                    "📌 비용 상세:",
                    data
                );

                setDetail(data);


                // =================================================
                // 비용 항목
                // =================================================

                const items =
                    Array.isArray(data?.itemList)
                        ? data.itemList
                        : [];


                // =================================================
                // 회사 지원금 초기화
                //
                // item.itemAmount
                //      → 신청금액
                //
                // item.itemApprovedAmount
                //      → 회사 지원금
                // =================================================

                const companyRows =
                    items.map((item, index) => {

                        return {

                            rowId:
                                `existing-${item.itemNo ?? index}`,

                            itemNo:
                                item.itemNo != null
                                    ? String(item.itemNo)
                                    : "",

                            amount:
                                item.itemApprovedAmount != null
                                    ? String(
                                        item.itemApprovedAmount
                                    )
                                    : "0"
                        };

                    });


                console.log(
                    "📌 회사 지원금 목록:",
                    companyRows
                );


                setCompanySupportRows(
                    companyRows
                );


                // =================================================
                // 지자체 지원금
                //
                // amount_list는 현재 amount_no PK
                // 따라서 하나의 신청당 1건
                // =================================================

                if (data?.sponsor) {

                    setLocalSupport({

                        sponsorName:
                            data.sponsor.sponsorName ?? "",

                        amount:
                            data.sponsor.amount != null
                                ? String(
                                    data.sponsor.amount
                                )
                                : "",

                        paymentDate:
                            data.sponsor.paymentDate
                                ? String(
                                    data.sponsor.paymentDate
                                ).substring(0, 10)
                                : "",

                        status:
                            data.sponsor.status ??
                            "UNPAID",

                        remark:
                            data.sponsor.remark ?? "",

                        itemNo:
                            data.sponsor.itemNo != null
                                ? String(
                                    data.sponsor.itemNo
                                )
                                : ""

                    });

                } else {

                    setLocalSupport({

                        sponsorName: "",
                        amount: "",
                        paymentDate: "",
                        status: "UNPAID",
                        remark: "",

                        itemNo:
                            items.length > 0
                                ? String(
                                    items[0].itemNo
                                )
                                : ""

                    });

                }

            } catch (error) {

                console.error(
                    "❌ 비용 상세 조회 실패:",
                    error
                );

                console.error(
                    "상태 코드:",
                    error.response?.status
                );

                console.error(
                    "서버 응답:",
                    error.response?.data
                );

                alert(
                    "비용 상세 정보를 불러오지 못했습니다."
                );

            } finally {

                setLoading(false);

            }

        };


        loadDetail();

    }, [amountNo]);


    // =========================================================
    // 회사 지원금 입력
    // =========================================================

    const handleCompanySupportChange = (
        rowId,
        value
    ) => {

        if (value === "") {

            setCompanySupportRows(prev =>
                prev.map(row =>
                    row.rowId === rowId
                        ? {
                            ...row,
                            amount: ""
                        }
                        : row
                )
            );

            return;
        }


        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return;
        }


        // 음수 방지
        if (number < 0) {
            value = "0";
        }


        setCompanySupportRows(prev =>
            prev.map(row =>
                row.rowId === rowId
                    ? {
                        ...row,
                        amount: value
                    }
                    : row
            )
        );

    };


    // =========================================================
    // 회사 지원금 합계
    // =========================================================

    const totalCompanySupport =
        companySupportRows.reduce(
            (sum, row) => {

                const amount =
                    Number(row.amount) || 0;

                return sum + amount;

            },
            0
        );


    // =========================================================
    // 지자체 지원금
    // =========================================================

    const totalLocalSupport =
        Number(localSupport.amount) || 0;


    // =========================================================
    // 신청금액 합계
    //
    // amount_item.amount 합계
    //
    // 회사 지원금과 별개의 값
    // =========================================================

    const requestedAmount =
        Array.isArray(detail?.itemList)
            ? detail.itemList.reduce(
                (sum, item) => {

                    return sum +
                        (
                            Number(item.itemAmount) || 0
                        );

                },
                0
            )
            : 0;


    // =========================================================
    // 전체 지원금
    // =========================================================

    const totalSupport =
        totalCompanySupport +
        totalLocalSupport;


    // =========================================================
    // 수정 가능 여부
    //
    // R : 검토중
    // H : 보류
    // =========================================================

    const canEditable =
        detail?.status === "R" ||
        detail?.status === "H";


    // =========================================================
    // 회사 지원금 적용
    //
    // 여기서는 DB 저장이 아니라
    // 현재 입력값을 검증하여 화면 상태에 반영
    //
    // 실제 DB 저장은 최종 승인 시 처리
    // =========================================================

    const handleCompanySupportApply = () => {

        if (!detail) {
            return;
        }


        const items =
            Array.isArray(detail.itemList)
                ? detail.itemList
                : [];


        // =====================================================
        // 항목별 검증
        // =====================================================

        for (const item of items) {

            const row =
                companySupportRows.find(
                    r =>
                        String(r.itemNo) ===
                        String(item.itemNo)
                );


            const requestAmount =
                Number(item.itemAmount) || 0;


            const companyAmount =
                Number(row?.amount) || 0;


            // 음수
            if (companyAmount < 0) {

                alert(
                    "회사 지원금은 0원 이상이어야 합니다."
                );

                return;

            }


            // 신청금액 초과
            if (
                companyAmount >
                requestAmount
            ) {

                alert(
                    `${itemTypeMap[item.itemType] || "비용 항목"}의 회사 지원금은 신청금액을 초과할 수 없습니다.`
                );

                return;

            }

        }


        // =====================================================
        // 회사 + 지자체 전체 금액
        // =====================================================

        const total =
            totalCompanySupport +
            totalLocalSupport;


        if (
            total >
            requestedAmount
        ) {

            alert(
                `총 지원금이 신청금액을 초과할 수 없습니다.\n\n` +
                `신청금액: ${formatMoney(requestedAmount)}\n` +
                `회사 지원금: ${formatMoney(totalCompanySupport)}\n` +
                `지자체 지원금: ${formatMoney(totalLocalSupport)}`
            );

            return;
        }


        alert(
            `회사 지원금 ${formatMoney(totalCompanySupport)}이 적용되었습니다.`
        );

    };


    // =========================================================
    // 지자체 지원금 적용
    // =========================================================

    const handleLocalSupportApply = () => {

        const amount =
            Number(localSupport.amount) || 0;


        // =====================================================
        // 금액 검증
        // =====================================================

        if (amount < 0) {

            alert(
                "지자체 지원금은 0원 이상 입력해주세요."
            );

            return;

        }


        // =====================================================
        // 지자체 지원금이 있는 경우
        // 지원기관 필수
        // =====================================================

        if (
            amount > 0 &&
            !localSupport.sponsorName.trim()
        ) {

            alert(
                "지자체 지원금이 있는 경우 지원기관을 입력해주세요."
            );

            return;

        }


        // =====================================================
        // 지급일
        // =====================================================

        if (
            amount > 0 &&
            !localSupport.paymentDate
        ) {

            alert(
                "지자체 지원금 지급일을 입력해주세요."
            );

            return;

        }


        // =====================================================
        // 전체 금액 검증
        // =====================================================

        const total =
            totalCompanySupport +
            amount;


        if (
            total >
            requestedAmount
        ) {

            alert(
                `회사 지원금과 지자체 지원금의 합계가 신청금액을 초과할 수 없습니다.\n\n` +
                `신청금액: ${formatMoney(requestedAmount)}\n` +
                `회사 지원금: ${formatMoney(totalCompanySupport)}\n` +
                `지자체 지원금: ${formatMoney(amount)}`
            );

            return;

        }


        alert(
            `지자체 지원금 ${formatMoney(amount)}이 적용되었습니다.`
        );

    };


    // =========================================================
    // 지자체 지원금 삭제
    // =========================================================

    const handleRemoveLocalSupport = () => {

        if (
            !window.confirm(
                "지자체 지원금 정보를 삭제하시겠습니까?"
            )
        ) {

            return;

        }


        setLocalSupport({

            sponsorName: "",

            amount: "",

            paymentDate: "",

            status: "UNPAID",

            remark: "",

            itemNo:
                detail?.itemList?.length > 0
                    ? String(
                        detail.itemList[0].itemNo
                    )
                    : ""

        });

    };


    // =========================================================
    // 최종 승인
    // =========================================================

    const handleApprovalSubmit = async () => {

        if (!detail) {
            return;
        }


        const items =
            Array.isArray(detail.itemList)
                ? detail.itemList
                : [];


        // =====================================================
        // 항목별 회사 지원금 검증
        // =====================================================

        for (const item of items) {

            const row =
                companySupportRows.find(
                    r =>
                        String(r.itemNo) ===
                        String(item.itemNo)
                );


            const requestAmount =
                Number(item.itemAmount) || 0;


            const companyAmount =
                Number(row?.amount) || 0;


            // 음수
            if (companyAmount < 0) {

                alert(
                    "회사 지원금은 0원 이상이어야 합니다."
                );

                return;

            }


            // 신청금액 초과
            if (
                companyAmount >
                requestAmount
            ) {

                alert(
                    `${itemTypeMap[item.itemType] || "비용 항목"}의 회사 지원금이 신청금액을 초과했습니다.`
                );

                return;

            }

        }


        // =====================================================
        // 회사 지원금
        // =====================================================

        const parsedCompanyAmount =
            totalCompanySupport;


        // =====================================================
        // 지자체 지원금
        // =====================================================

        const parsedLocalAmount =
            Number(localSupport.amount) || 0;


        // =====================================================
        // 지자체 지원기관
        // =====================================================

        if (
            parsedLocalAmount > 0 &&
            !localSupport.sponsorName.trim()
        ) {

            alert(
                "지자체 지원금이 있는 경우 지원기관을 입력해주세요."
            );

            return;

        }


        // =====================================================
        // 지급일
        // =====================================================

        if (
            parsedLocalAmount > 0 &&
            !localSupport.paymentDate
        ) {

            alert(
                "지자체 지원금 지급일을 입력해주세요."
            );

            return;

        }


        // =====================================================
        // 전체 지원금 검증
        // =====================================================

        if (
            parsedCompanyAmount +
            parsedLocalAmount >
            requestedAmount
        ) {

            alert(
                `총 지원금이 신청금액을 초과할 수 없습니다.\n\n` +
                `신청금액: ${formatMoney(requestedAmount)}\n` +
                `회사 지원금: ${formatMoney(parsedCompanyAmount)}\n` +
                `지자체 지원금: ${formatMoney(parsedLocalAmount)}`
            );

            return;

        }


        // =====================================================
        // 승인 확인
        // =====================================================

        const confirmMessage =
            `승인하시겠습니까?\n\n` +

            `신청금액: ${formatMoney(requestedAmount)}\n` +

            `회사 지원금: ${formatMoney(parsedCompanyAmount)}\n` +

            `지자체 지원금: ${formatMoney(parsedLocalAmount)}\n\n` +

            `회사 지원금은 항목별로 저장됩니다.`;


        if (
            !window.confirm(
                confirmMessage
            )
        ) {

            return;

        }


        try {

            console.log(
                "================================="
            );

            console.log(
                "📌 비용 승인 처리"
            );

            console.log(
                "📌 amountNo:",
                detail.amountNo
            );

            console.log(
                "📌 신청금액:",
                requestedAmount
            );

            console.log(
                "📌 회사 지원금:",
                parsedCompanyAmount
            );

            console.log(
                "📌 지자체 지원금:",
                parsedLocalAmount
            );

            console.log(
                "📌 항목별 회사 지원금:",
                companySupportRows
            );

            console.log(
                "📌 지자체 지원금 정보:",
                localSupport
            );

            console.log(
                "================================="
            );


            // =================================================
            // 승인 API
            //
            // 중요
            //
            // item.itemAmount
            //      → 신청금액
            //      → 수정하지 않음
            //
            // item.itemApprovedAmount
            //      → 회사 지원금
            //      → 항목별 저장
            //
            // sponsor.amount
            //      → 지자체 지원금
            // =================================================

            await amountApi.updateApproval(
                detail.amountNo,
                "A",
                parsedCompanyAmount,
                comment,
                "",
                parsedLocalAmount,
                localSupport.sponsorName || "",
                localSupport.status || "UNPAID"
            );


            alert(
                "승인 및 지원금 반영이 완료되었습니다."
            );


            navigate(
                "/admin/cost/list"
            );


        } catch (error) {

            console.error(
                "❌ 승인 처리 실패:",
                error
            );

            console.error(
                "상태 코드:",
                error.response?.status
            );

            console.error(
                "서버 응답:",
                error.response?.data
            );


            alert(
                error?.response?.data?.message ||
                "승인 처리 중 오류가 발생했습니다."
            );

        }

    };


    // =========================================================
    // 로딩
    // =========================================================

    if (loading) {

        return (

            <div className="amount-detail-loading">

                로딩 중...

            </div>

        );

    }


    // =========================================================
    // 상세 없음
    // =========================================================

    if (!detail) {

        return (

            <div className="amount-detail-empty">

                비용 신청 정보를 찾을 수 없습니다.

            </div>

        );

    }


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="amount-detail-container">


            {/* =================================================
                제목
            ================================================== */}

            <div className="amount-detail-header">

                <h2>
                    비용 신청 상세
                </h2>

                <span
                    className={`status status-${detail.status}`}
                >

                    {
                        statusMap[detail.status] ||
                        detail.status
                    }

                </span>

            </div>


            {/* =================================================
                기본 정보
            ================================================== */}

            <div className="amount-info-box">

                <div className="info-row">

                    <div className="info-item">

                        <span className="info-label">
                            신청번호
                        </span>

                        <span className="info-value">
                            {detail.amountNo}
                        </span>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            신청자
                        </span>

                        <span className="info-value">
                            {detail.empName || "-"}
                        </span>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            신청일
                        </span>

                        <span className="info-value">
                            {
                                formatDate(
                                    detail.requestedAt
                                )
                            }
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                비용 항목
            ================================================== */}

            <div className="amount-section">

                <h3>
                    비용 항목
                </h3>


                <table className="amount-item-table">

                    <thead>

                        <tr>

                            <th>
                                비용 항목
                            </th>

                            <th>
                                설명
                            </th>

                            <th>
                                사용일
                            </th>

                            <th>
                                신청금액
                            </th>

                            <th>
                                회사 지원금
                            </th>

                            <th>
                                관리
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {
                            detail.itemList?.length > 0

                                ? detail.itemList.map(
                                    (item, index) => {

                                        const row =
                                            companySupportRows.find(
                                                r =>
                                                    String(
                                                        r.itemNo
                                                    ) ===
                                                    String(
                                                        item.itemNo
                                                    )
                                            );


                                        const requestAmount =
                                            Number(
                                                item.itemAmount
                                            ) || 0;


                                        const companyAmount =
                                            Number(
                                                row?.amount
                                            ) || 0;


                                        return (

                                            <tr
                                                key={
                                                    item.itemNo ??
                                                    index
                                                }
                                            >


                                                {/* 비용 항목 */}

                                                <td>

                                                    {
                                                        itemTypeMap[
                                                            item.itemType
                                                        ] ||

                                                        item.itemType ||

                                                        "-"
                                                    }

                                                </td>


                                                {/* 설명 */}

                                                <td>

                                                    {
                                                        item.itemDescription ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* 사용일 */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            item.itemDate
                                                        )
                                                    }

                                                </td>


                                                {/* 신청금액 */}

                                                <td className="money-cell">

                                                    {
                                                        formatMoney(
                                                            requestAmount
                                                        )
                                                    }

                                                </td>


                                                {/* 회사 지원금 */}

                                                <td>

                                                    {
                                                        canEditable

                                                            ? (

                                                                <input
                                                                    type="number"
                                                                    className="company-support-input"
                                                                    min="0"
                                                                    max={
                                                                        requestAmount
                                                                    }
                                                                    step="1"

                                                                    value={
                                                                        row?.amount ??
                                                                        "0"
                                                                    }

                                                                    placeholder="금액 입력"

                                                                    onChange={
                                                                        (e) =>
                                                                            handleCompanySupportChange(
                                                                                row?.rowId,
                                                                                e.target.value
                                                                            )
                                                                    }
                                                                />

                                                            )

                                                            : (

                                                                <span>

                                                                    {
                                                                        row?.amount !==
                                                                            undefined &&
                                                                        row?.amount !==
                                                                            null &&
                                                                        row?.amount !==
                                                                            ""

                                                                            ? formatMoney(
                                                                                row.amount
                                                                            )

                                                                            : "-"
                                                                    }

                                                                </span>

                                                            )
                                                    }

                                                </td>


                                                {/* 관리 */}

                                                <td>

                                                    {
                                                        canEditable && (

                                                            <button
                                                                type="button"
                                                                className="btn-small"

                                                                onClick={() => {

                                                                    if (
                                                                        row?.amount ===
                                                                        undefined ||
                                                                        row?.amount ===
                                                                        ""
                                                                    ) {

                                                                        alert(
                                                                            "회사 지원금을 입력해주세요."
                                                                        );

                                                                        return;

                                                                    }


                                                                    if (
                                                                        companyAmount <
                                                                        0
                                                                    ) {

                                                                        alert(
                                                                            "회사 지원금은 0원 이상이어야 합니다."
                                                                        );

                                                                        return;

                                                                    }


                                                                    if (
                                                                        companyAmount >
                                                                        requestAmount
                                                                    ) {

                                                                        alert(
                                                                            "회사 지원금은 신청금액을 초과할 수 없습니다."
                                                                        );

                                                                        return;

                                                                    }


                                                                    if (
                                                                        totalCompanySupport +
                                                                        totalLocalSupport >
                                                                        requestedAmount
                                                                    ) {

                                                                        alert(
                                                                            "회사 지원금과 지자체 지원금의 합계가 신청금액을 초과할 수 없습니다."
                                                                        );

                                                                        return;

                                                                    }


                                                                    alert(
                                                                        `${formatMoney(companyAmount)} 회사 지원금이 적용되었습니다.`
                                                                    );

                                                                }}
                                                            >

                                                                적용

                                                            </button>

                                                        )
                                                    }

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                                : (

                                    <tr>

                                        <td colSpan="6">

                                            등록된 비용 항목이 없습니다.

                                        </td>

                                    </tr>

                                )
                        }

                    </tbody>

                </table>


                {/* =================================================
                    비용 합계
                ================================================== */}

                <div className="amount-summary">

                    <div>

                        <span>
                            신청금액
                        </span>

                        <strong>
                            {
                                formatMoney(
                                    requestedAmount
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            회사 지원금
                        </span>

                        <strong>
                            {
                                formatMoney(
                                    totalCompanySupport
                                )
                            }
                        </strong>

                    </div>

                </div>


                {
                    canEditable && (

                        <button
                            type="button"
                            className="btn-apply-company"
                            onClick={
                                handleCompanySupportApply
                            }
                        >

                            회사 지원금 적용

                        </button>

                    )
                }

            </div>


            {/* =================================================
                지자체 지원금
            ================================================== */}

            <div className="amount-section">

                <h3>
                    지자체 지원금
                </h3>


                <div className="local-support-form">


                    {/* 지원기관 */}

                    <div className="form-row">

                        <label>
                            지원기관
                        </label>

                        <input
                            type="text"
                            value={
                                localSupport.sponsorName
                            }
                            disabled={!canEditable}

                            onChange={(e) =>
                                setLocalSupport(
                                    prev => ({
                                        ...prev,
                                        sponsorName:
                                            e.target.value
                                    })
                                )
                            }
                        />

                    </div>


                    {/* 지원금 */}

                    <div className="form-row">

                        <label>
                            지원금
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                                localSupport.amount
                            }
                            disabled={!canEditable}

                            onChange={(e) =>
                                setLocalSupport(
                                    prev => ({
                                        ...prev,
                                        amount:
                                            e.target.value
                                    })
                                )
                            }
                        />

                    </div>


                    {/* 지급일 */}

                    <div className="form-row">

                        <label>
                            지급일
                        </label>

                        <input
                            type="date"
                            value={
                                localSupport.paymentDate
                            }
                            disabled={!canEditable}

                            onChange={(e) =>
                                setLocalSupport(
                                    prev => ({
                                        ...prev,
                                        paymentDate:
                                            e.target.value
                                    })
                                )
                            }
                        />

                    </div>


                    {/* 상태 */}

                    <div className="form-row">

                        <label>
                            상태
                        </label>

                        <select
                            value={
                                localSupport.status
                            }
                            disabled={!canEditable}

                            onChange={(e) =>
                                setLocalSupport(
                                    prev => ({
                                        ...prev,
                                        status:
                                            e.target.value
                                    })
                                )
                            }
                        >

                            <option value="UNPAID">
                                미지급
                            </option>

                            <option value="PAID">
                                지급완료
                            </option>

                            <option value="HOLD">
                                보류
                            </option>

                        </select>

                    </div>


                    {/* 비고 */}

                    <div className="form-row">

                        <label>
                            비고
                        </label>

                        <textarea
                            value={
                                localSupport.remark
                            }
                            disabled={!canEditable}

                            onChange={(e) =>
                                setLocalSupport(
                                    prev => ({
                                        ...prev,
                                        remark:
                                            e.target.value
                                    })
                                )
                            }
                        />

                    </div>


                    {/* 버튼 */}

                    {
                        canEditable && (

                            <div className="local-support-buttons">

                                <button
                                    type="button"
                                    onClick={
                                        handleLocalSupportApply
                                    }
                                >

                                    적용

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleRemoveLocalSupport
                                    }
                                >

                                    삭제

                                </button>

                            </div>

                        )
                    }

                </div>

            </div>


            {/* =================================================
                지원금 합계
            ================================================== */}

            <div className="amount-total-box">

                <div>

                    <span>
                        신청금액
                    </span>

                    <strong>
                        {
                            formatMoney(
                                requestedAmount
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        회사 지원금
                    </span>

                    <strong>
                        {
                            formatMoney(
                                totalCompanySupport
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        지자체 지원금
                    </span>

                    <strong>
                        {
                            formatMoney(
                                totalLocalSupport
                            )
                        }
                    </strong>

                </div>


                <div className="final-total">

                    <span>
                        총 지원금
                    </span>

                    <strong>
                        {
                            formatMoney(
                                totalSupport
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* =================================================
                관리자 코멘트
            ================================================== */}

            {
                canEditable && (

                    <div className="amount-section">

                        <h3>
                            관리자 의견
                        </h3>

                        <textarea
                            className="admin-comment"
                            value={comment}
                            placeholder="승인 의견을 입력해주세요."

                            onChange={(e) =>
                                setComment(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                )
            }


            {/* =================================================
                하단 버튼
            ================================================== */}

            <div className="amount-detail-buttons">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/cost/list"
                        )
                    }
                >

                    목록

                </button>


                {
                    canEditable && (

                        <button
                            type="button"
                            className="btn-approval"
                            onClick={
                                handleApprovalSubmit
                            }
                        >

                            승인 및 지원금 반영

                        </button>

                    )
                }

            </div>

        </div>

    );

}