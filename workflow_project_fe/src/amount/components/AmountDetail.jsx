import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { amountApi } from "../../Amount/api/amountApi";

import "../../Amount/styles/AmountDetail.css";

export default function AmountDetail() {

    const { amountNo } = useParams();
    const navigate = useNavigate();

    // =========================================================
    // State
    // =========================================================

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    // 회사 지원금
    const [companySupportRows, setCompanySupportRows] = useState([]);

    // 지자체 지원금
    const [localSupport, setLocalSupport] = useState({
        sponsorName: "",
        amount: "",
        paymentDate: "",
        status: "UNPAID",
        remark: "",
        itemNo: ""
    });

    // 관리자 의견
    const [comment, setComment] = useState("");

    // 처리 중
    const [processing, setProcessing] = useState(false);

    // =========================================================
    // Mapping
    // =========================================================

    const statusMap = {
        A: "승인",
        C: "취소",
        H: "보류",
        J: "반려",
        R: "검토중"
    };

    const itemTypeMap = {
        S: "숙박",
        T: "교통",
        E: "체험",
        F: "식비",
        V: "차량",
        O: "기타"
    };

    const sponsorStatusMap = {
        UNPAID: "미지급",
        PAID: "지급완료",
        HOLD: "보류"
    };

    // =========================================================
    // Format
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
                    await amountApi.getAmountById(Number(amountNo));

                const data = response?.data ?? response;

                console.log("📌 비용 상세:", data);

                setDetail(data);

                // -------------------------------------------------
                // 회사 지원금
                // -------------------------------------------------

                const items =
                    Array.isArray(data?.itemList)
                        ? data.itemList
                        : [];

                const companyRows = items.map((item, index) => ({

                    rowId:
                        `existing-${item.itemNo ?? index}`,

                    itemNo:
                        item.itemNo != null
                            ? String(item.itemNo)
                            : "",

                    amount:
                        item.itemApprovedAmount != null
                            ? String(item.itemApprovedAmount)
                            : "0"
                }));

                console.log(
                    "📌 회사 지원금 목록:",
                    companyRows
                );

                setCompanySupportRows(companyRows);

                // -------------------------------------------------
                // 지자체 지원금
                // -------------------------------------------------

                if (data?.sponsor) {

                    setLocalSupport({

                        sponsorName:
                            data.sponsor.sponsorName ?? "",

                        amount:
                            data.sponsor.amount != null
                                ? String(data.sponsor.amount)
                                : "",

                        paymentDate:
                            data.sponsor.paymentDate
                                ? String(
                                    data.sponsor.paymentDate
                                ).substring(0, 10)
                                : "",

                        status:
                            data.sponsor.status ?? "UNPAID",

                        remark:
                            data.sponsor.remark ?? "",

                        itemNo:
                            data.sponsor.itemNo != null
                                ? String(data.sponsor.itemNo)
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
                                ? String(items[0].itemNo)
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
    // 회사 지원금 변경
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

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return;
        }

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
    // 지자체 지원금 변경
    // =========================================================

    const handleLocalSupportChange = (
        field,
        value
    ) => {

        setLocalSupport(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // =========================================================
    // 금액 계산
    // =========================================================

    const totalCompanySupport =
        companySupportRows.reduce(
            (sum, row) =>
                sum + (Number(row.amount) || 0),
            0
        );

    const totalLocalSupport =
        Number(localSupport.amount) || 0;

    const requestedAmount =
        Array.isArray(detail?.itemList)
            ? detail.itemList.reduce(
                (sum, item) =>
                    sum + (Number(item.amount) || 0),
                0
            )
            : 0;

    const totalSupport =
        totalCompanySupport +
        totalLocalSupport;

    // =========================================================
    // 수정 가능 여부
    // R = 검토중
    // H = 보류
    // =========================================================

    const canEditable =
        detail?.status === "R" ||
        detail?.status === "H";

    // =========================================================
    // 회사 지원금 적용
    // =========================================================

    const handleCompanySupportApply = () => {

        if (!detail) {
            return;
        }

        const items =
            Array.isArray(detail.itemList)
                ? detail.itemList
                : [];

        for (const item of items) {

            const row =
                companySupportRows.find(
                    r =>
                        String(r.itemNo) ===
                        String(item.itemNo)
                );

            const requestAmount =
                Number(item.amount) || 0;

            const companyAmount =
                Number(row?.amount) || 0;

            const itemType =
                item.itemType ||
                item.amountItemType ||
                item.amountitemType ||
                "O";

            if (companyAmount < 0) {

                alert(
                    "회사 지원금은 0원 이상이어야 합니다."
                );

                return;
            }

            if (companyAmount > requestAmount) {

                alert(
                    `${itemTypeMap[itemType] || "비용 항목"}의 회사 지원금은 신청금액을 초과할 수 없습니다.`
                );

                return;
            }
        }

        const total =
            totalCompanySupport +
            totalLocalSupport;

        if (total > requestedAmount) {

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

        if (amount < 0) {

            alert(
                "지자체 지원금은 0원 이상 입력해주세요."
            );

            return;
        }

        if (
            amount > 0 &&
            !localSupport.sponsorName.trim()
        ) {

            alert(
                "지자체 지원금이 있는 경우 지원기관을 입력해주세요."
            );

            return;
        }

        if (
            amount > 0 &&
            !localSupport.paymentDate
        ) {

            alert(
                "지자체 지원금 지급일을 입력해주세요."
            );

            return;
        }

        const total =
            totalCompanySupport +
            amount;

        if (total > requestedAmount) {

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
                    ? String(detail.itemList[0].itemNo)
                    : ""
        });
    };

    // =========================================================
    // 항목별 회사 지원금 검증
    // =========================================================

    const validateCompanySupport = () => {

        if (!detail) {
            return false;
        }

        const items =
            Array.isArray(detail.itemList)
                ? detail.itemList
                : [];

        for (const item of items) {

            const row =
                companySupportRows.find(
                    r =>
                        String(r.itemNo) ===
                        String(item.itemNo)
                );

            const requestAmount =
                Number(item.amount) || 0;

            const companyAmount =
                Number(row?.amount) || 0;

            const itemType =
                item.itemType ||
                item.amountItemType ||
                item.amountitemType ||
                "O";

            if (companyAmount < 0) {

                alert(
                    "회사 지원금은 0원 이상이어야 합니다."
                );

                return false;
            }

            if (companyAmount > requestAmount) {

                alert(
                    `${itemTypeMap[itemType] || "비용 항목"}의 회사 지원금이 신청금액을 초과했습니다.`
                );

                return false;
            }
        }

        return true;
    };

    // =========================================================
    // 승인
    // =========================================================

    const handleApprove = async () => {

        if (!detail) {
            return;
        }

        // 회사 지원금 검증
        if (!validateCompanySupport()) {
            return;
        }

        const parsedCompanyAmount =
            totalCompanySupport;

        const parsedLocalAmount =
            Number(localSupport.amount) || 0;

        // 지자체 지원금 검증
        if (
            parsedLocalAmount > 0 &&
            !localSupport.sponsorName.trim()
        ) {

            alert(
                "지자체 지원금이 있는 경우 지원기관을 입력해주세요."
            );

            return;
        }

        if (
            parsedLocalAmount > 0 &&
            !localSupport.paymentDate
        ) {

            alert(
                "지자체 지원금 지급일을 입력해주세요."
            );

            return;
        }

        // 총 지원금 검증
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

        const confirmMessage =
            `승인하시겠습니까?\n\n` +
            `신청금액: ${formatMoney(requestedAmount)}\n` +
            `회사 지원금: ${formatMoney(parsedCompanyAmount)}\n` +
            `지자체 지원금: ${formatMoney(parsedLocalAmount)}\n\n` +
            `회사 지원금은 항목별로 저장됩니다.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {

            setProcessing(true);

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

            navigate("/admin/cost/list");

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

        } finally {

            setProcessing(false);
        }
    };

    // =========================================================
    // 보류 / 반려
    // =========================================================

    const handleRejectOrHold = async (
        approvalStatus
    ) => {

        if (!detail) {
            return;
        }

        const statusName =
            approvalStatus === "H"
                ? "보류"
                : "반려";

        // 사유 필수
        const reason =
            comment.trim();

        if (!reason) {

            alert(
                `${statusName} 사유를 입력해주세요.`
            );

            return;
        }

        const confirmMessage =
            `${statusName} 처리하시겠습니까?\n\n` +
            `신청번호: ${detail.amountNo}\n` +
            `사원명: ${detail.empName || "-"}\n` +
            `신청금액: ${formatMoney(requestedAmount)}\n\n` +
            `${statusName} 사유:\n${reason}`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {

            setProcessing(true);

            /*
             * 보류 / 반려
             *
             * 승인금액       0
             * 지자체 지원금  0
             * 지원기관       ""
             * 지원상태       UNPAID
             *
             * 실제 저장 여부는 backend updateApproval 구현에 따라 결정됨.
             */

            await amountApi.updateApproval(
                detail.amountNo,
                approvalStatus,
                0,
                reason,
                "",
                0,
                "",
                "UNPAID"
            );

            alert(
                `${statusName} 처리가 완료되었습니다.`
            );

            navigate("/admin/cost/list");

        } catch (error) {

            console.error(
                `❌ ${statusName} 처리 실패:`,
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
                `${statusName} 처리 중 오류가 발생했습니다.`
            );

        } finally {

            setProcessing(false);
        }
    };

    // =========================================================
    // Loading
    // =========================================================

    if (loading) {

        return (
            <div className="amount-detail-container">

                <div className="amount-loading">
                    비용 상세 정보를 불러오는 중입니다...
                </div>

            </div>
        );
    }

    // =========================================================
    // Detail 없음
    // =========================================================

    if (!detail) {

        return (
            <div className="amount-detail-container">

                <div className="amount-empty">
                    비용 상세 정보를 찾을 수 없습니다.
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/cost/list")
                    }
                >
                    목록으로
                </button>

            </div>
        );
    }

    // =========================================================
    // Render
    // =========================================================

    return (

        <div className="amount-detail-container">

            {/* =================================================
                Header
            ================================================= */}

            <div className="amount-detail-header">

                <div>

                    <h2>
                        비용 신청 상세
                    </h2>

                    <p>
                        신청번호 #{detail.amountNo}
                    </p>

                </div>

                <div
                    className={`amount-status status-${detail.status}`}
                >
                    {statusMap[detail.status] ||
                        detail.status ||
                        "-"}
                </div>

            </div>


            {/* =================================================
                신청 기본정보
            ================================================= */}

            <section className="amount-detail-section">

                <h3>
                    신청 정보
                </h3>

                <div className="amount-info-grid">

                    <div className="amount-info-item">

                        <span>
                            신청번호
                        </span>

                        <strong>
                            {detail.amountNo}
                        </strong>

                    </div>


                    <div className="amount-info-item">

                        <span>
                            신청자
                        </span>

                        <strong>
                            {detail.empName || "-"}
                        </strong>

                    </div>


                    <div className="amount-info-item">

                        <span>
                            신청일
                        </span>

                        <strong>
                            {formatDate(
                                detail.requestedAt ||
                                detail.createdAt
                            )}
                        </strong>

                    </div>


                    <div className="amount-info-item">

                        <span>
                            처리일
                        </span>

                        <strong>
                            {formatDate(
                                detail.approvedAt
                            )}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                비용 항목
            ================================================= */}

            <section className="amount-detail-section">

                <div className="section-title-row">

                    <h3>
                        비용 항목
                    </h3>

                    <span>
                        신청금액{" "}
                        <strong>
                            {formatMoney(requestedAmount)}
                        </strong>
                    </span>

                </div>


                <div className="amount-table-wrapper">

                    <table className="amount-detail-table">

                        <thead>

                            <tr>

                                <th>
                                    항목
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

                            </tr>

                        </thead>


                        <tbody>

                            {Array.isArray(detail.itemList) &&
                            detail.itemList.length > 0 ? (

                                detail.itemList.map(
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

                                        const itemType =
                                            item.itemType ||
                                            item.amountItemType ||
                                            item.amountitemType ||
                                            "O";

                                        return (

                                            <tr
                                                key={
                                                    item.itemNo ??
                                                    index
                                                }
                                            >

                                                <td>
                                                    <span className="amount-item-badge">
                                                        {itemTypeMap[
                                                            itemType
                                                        ] ||
                                                            itemType}
                                                    </span>
                                                </td>


                                                <td>
                                                    {item.itemDescription ||
                                                        item.description ||
                                                        "-"}
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        item.itemDate
                                                    )}
                                                </td>


                                                <td className="amount-number">
                                                    {formatMoney(
                                                        item.amount
                                                    )}
                                                </td>


                                                <td>

                                                    {canEditable ? (

                                                        <div className="amount-input-wrapper">

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    row?.amount ??
                                                                    "0"
                                                                }
                                                                onChange={e =>
                                                                    handleCompanySupportChange(
                                                                        row?.rowId,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                원
                                                            </span>

                                                        </div>

                                                    ) : (

                                                        formatMoney(
                                                            item.itemApprovedAmount
                                                        )

                                                    )}

                                                </td>

                                            </tr>

                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-row"
                                    >
                                        비용 항목이 없습니다.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* 회사 지원금 적용 */}

                {canEditable && (

                    <div className="amount-action-row">

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={
                                handleCompanySupportApply
                            }
                            disabled={processing}
                        >
                            회사 지원금 적용
                        </button>

                    </div>

                )}

            </section>


            {/* =================================================
                지자체 지원금
            ================================================= */}

            <section className="amount-detail-section">

                <div className="section-title-row">

                    <h3>
                        지자체 지원금
                    </h3>

                    <span>
                        {formatMoney(
                            totalLocalSupport
                        )}
                    </span>

                </div>


                {canEditable ? (

                    <div className="local-support-form">

                        <div className="form-row">

                            <label>
                                지원기관
                            </label>

                            <input
                                type="text"
                                value={
                                    localSupport.sponsorName
                                }
                                onChange={e =>
                                    handleLocalSupportChange(
                                        "sponsorName",
                                        e.target.value
                                    )
                                }
                                placeholder="지원기관명을 입력해주세요."
                            />

                        </div>


                        <div className="form-row">

                            <label>
                                지원금
                            </label>

                            <div className="amount-input-wrapper">

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        localSupport.amount
                                    }
                                    onChange={e =>
                                        handleLocalSupportChange(
                                            "amount",
                                            e.target.value
                                        )
                                    }
                                    placeholder="0"
                                />

                                <span>
                                    원
                                </span>

                            </div>

                        </div>


                        <div className="form-row">

                            <label>
                                지급일
                            </label>

                            <input
                                type="date"
                                value={
                                    localSupport.paymentDate
                                }
                                onChange={e =>
                                    handleLocalSupportChange(
                                        "paymentDate",
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-row">

                            <label>
                                지급상태
                            </label>

                            <select
                                value={
                                    localSupport.status
                                }
                                onChange={e =>
                                    handleLocalSupportChange(
                                        "status",
                                        e.target.value
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


                        <div className="form-row">

                            <label>
                                비고
                            </label>

                            <textarea
                                value={
                                    localSupport.remark
                                }
                                onChange={e =>
                                    handleLocalSupportChange(
                                        "remark",
                                        e.target.value
                                    )
                                }
                                placeholder="지자체 지원금 관련 내용을 입력해주세요."
                            />

                        </div>


                        <div className="amount-action-row">

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={
                                    handleLocalSupportApply
                                }
                                disabled={processing}
                            >
                                지자체 지원금 적용
                            </button>


                            <button
                                type="button"
                                className="btn-danger-outline"
                                onClick={
                                    handleRemoveLocalSupport
                                }
                                disabled={processing}
                            >
                                삭제
                            </button>

                        </div>

                    </div>

                ) : (

                    <div className="local-support-view">

                        <div className="support-info-row">

                            <span>
                                지원기관
                            </span>

                            <strong>
                                {localSupport.sponsorName ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="support-info-row">

                            <span>
                                지원금
                            </span>

                            <strong>
                                {formatMoney(
                                    localSupport.amount
                                )}
                            </strong>

                        </div>


                        <div className="support-info-row">

                            <span>
                                지급일
                            </span>

                            <strong>
                                {formatDate(
                                    localSupport.paymentDate
                                )}
                            </strong>

                        </div>


                        <div className="support-info-row">

                            <span>
                                지급상태
                            </span>

                            <strong>
                                {
                                    sponsorStatusMap[
                                        localSupport.status
                                    ] ||
                                    localSupport.status ||
                                    "-"
                                }
                            </strong>

                        </div>


                        {localSupport.remark && (

                            <div className="support-info-row">

                                <span>
                                    비고
                                </span>

                                <strong>
                                    {localSupport.remark}
                                </strong>

                            </div>

                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                총 금액
            ================================================= */}

            <section className="amount-total-section">

                <div className="total-row">

                    <span>
                        신청금액
                    </span>

                    <strong>
                        {formatMoney(
                            requestedAmount
                        )}
                    </strong>

                </div>


                <div className="total-row">

                    <span>
                        회사 지원금
                    </span>

                    <strong>
                        {formatMoney(
                            totalCompanySupport
                        )}
                    </strong>

                </div>


                <div className="total-row">

                    <span>
                        지자체 지원금
                    </span>

                    <strong>
                        {formatMoney(
                            totalLocalSupport
                        )}
                    </strong>

                </div>


                <div className="total-row total-main">

                    <span>
                        총 지원금
                    </span>

                    <strong>
                        {formatMoney(
                            totalSupport
                        )}
                    </strong>

                </div>


                <div className="total-row">

                    <span>
                        지원 후 잔액
                    </span>

                    <strong>
                        {formatMoney(
                            Math.max(
                                requestedAmount -
                                totalSupport,
                                0
                            )
                        )}
                    </strong>

                </div>

            </section>


            {/* =================================================
                관리자 의견
            ================================================= */}

            {canEditable && (

                <section className="amount-detail-section">

                    <h3>
                        관리자 의견
                    </h3>

                    <textarea
                        className="admin-comment"
                        value={comment}
                        onChange={e =>
                            setComment(
                                e.target.value
                            )
                        }
                        placeholder="승인, 보류 또는 반려 의견을 입력해주세요."
                        disabled={processing}
                    />

                    <p className="comment-help">
                        ※ 보류 또는 반려 처리 시 사유 입력이 필수입니다.
                    </p>

                </section>

            )}


            {/* =================================================
                기존 관리자 의견
            ================================================= */}

            {!canEditable &&
                detail.amountComment && (

                    <section className="amount-detail-section">

                        <h3>
                            관리자 의견
                        </h3>

                        <div className="admin-comment-view">
                            {detail.amountComment}
                        </div>

                    </section>

                )}


            {/* =================================================
                하단 버튼
            ================================================= */}

            <div className="amount-detail-footer">

                <button
                    type="button"
                    className="btn-list"
                    onClick={() =>
                        navigate("/admin/cost/list")
                    }
                    disabled={processing}
                >
                    목록
                </button>


                {canEditable && (

                    <div className="approval-button-group">

                        {/* 보류 */}

                        <button
                            type="button"
                            className="btn-hold"
                            onClick={() =>
                                handleRejectOrHold("H")
                            }
                            disabled={processing}
                        >
                            {processing
                                ? "처리 중..."
                                : "보류"}
                        </button>


                        {/* 반려 */}

                        <button
                            type="button"
                            className="btn-reject"
                            onClick={() =>
                                handleRejectOrHold("J")
                            }
                            disabled={processing}
                        >
                            {processing
                                ? "처리 중..."
                                : "반려"}
                        </button>


                        {/* 승인 */}

                        <button
                            type="button"
                            className="btn-approve"
                            onClick={
                                handleApprove
                            }
                            disabled={processing}
                        >
                            {processing
                                ? "처리 중..."
                                : "승인 및 지원금 반영"}
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}