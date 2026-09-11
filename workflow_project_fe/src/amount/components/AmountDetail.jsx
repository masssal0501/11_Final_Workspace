import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { amountApi } from "../../amount/api/amountApi";
import "../../Amount/styles/AmountStyle.css";


/* =========================================================
   상태
   ========================================================= */

const statusMap = {
    A: "승인",
    C: "취소",
    H: "보류",
    J: "반려",
    R: "검토중"
};


/* =========================================================
   비용 항목
   ========================================================= */

const itemTypeMap = {
    S: "숙박",
    T: "교통",
    E: "체험",
    F: "식비",
    V: "차량",
    O: "기타"
};


/* =========================================================
   금액 포맷
   ========================================================= */

const formatMoney = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
        return "0원";
    }

    return `${number.toLocaleString("ko-KR")}원`;
};


/* =========================================================
   날짜 포맷
   ========================================================= */

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).substring(0, 10);
    }

    return date.toLocaleDateString("ko-KR");
};


/* =========================================================
   상태 표시
   ========================================================= */

const getStatusClass = (status) => {
    switch (status) {
        case "A":
            return "status-approved";

        case "H":
            return "status-hold";

        case "J":
            return "status-rejected";

        case "C":
            return "status-cancelled";

        case "R":
        default:
            return "status-review";
    }
};


/* =========================================================
   Component
   ========================================================= */

export default function AmountDetail() {

    const navigate = useNavigate();
    const { amountNo } = useParams();

    const [detail, setDetail] = useState(null);

    const [loading, setLoading] = useState(true);

    const [companySupportRows, setCompanySupportRows] = useState([]);

    // 지자체 지원금
    // DB amount_list 조회 결과
    const [supportList, setSupportList] = useState([]);

    // 관리자 의견
    const [comment, setComment] = useState("");


    /* =====================================================
       상세 조회
       ===================================================== */

    useEffect(() => {

        const fetchDetail = async () => {

            try {

                setLoading(true);

                const data =
                    await amountApi.getAmountById(Number(amountNo));

                console.log("===== 비용 정산 상세 =====");
                console.log("상세 데이터:", data);

                setDetail(data);


                /* ---------------------------------------------
                   회사 지원금
                   amount_item.item_approved_amount
                   --------------------------------------------- */

                const items =
                    Array.isArray(data?.itemList)
                        ? data.itemList
                        : [];

                const companyRows = items.map((item) => ({
                    itemNo: item.itemNo,
                    amount: Number(item.itemApprovedAmount) || 0
                }));

                setCompanySupportRows(companyRows);


                /* ---------------------------------------------
                   지자체 지원금
                   amount_list
                   --------------------------------------------- */

                const supports =
                    Array.isArray(data?.supportList)
                        ? data.supportList
                        : [];

                console.log("지자체 지원금:", supports);

                setSupportList(supports);


                /* ---------------------------------------------
                   기존 의견
                   --------------------------------------------- */

                if (data?.amountComment) {
                    setComment(data.amountComment);
                }

            } catch (error) {

                console.error(
                    "❌ 비용 정산 상세 조회 실패:",
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
                    error.response?.data?.message ||
                    "비용 정산 상세 정보를 불러오지 못했습니다."
                );

                navigate("/admin/cost/list");

            } finally {

                setLoading(false);

            }
        };


        if (amountNo) {
            fetchDetail();
        }

    }, [amountNo, navigate]);


    /* =====================================================
       신청 금액
       ===================================================== */

    const requestedAmount = useMemo(() => {

        if (!detail?.itemList) {
            return 0;
        }

        return detail.itemList.reduce(
            (sum, item) =>
                sum + (Number(item.itemAmount) || 0),
            0
        );

    }, [detail]);


    /* =====================================================
       회사 지원금 합계
       ===================================================== */

    const totalCompanySupport = useMemo(() => {

        return companySupportRows.reduce(
            (sum, row) =>
                sum + (Number(row.amount) || 0),
            0
        );

    }, [companySupportRows]);


    /* =====================================================
       지자체 지원금 합계
       ※ 승인 지원금 기준
       ===================================================== */

    const totalLocalSupport = useMemo(() => {

        return supportList.reduce(
            (sum, support) =>
                sum +
                (Number(support.approvedAmount) || 0),
            0
        );

    }, [supportList]);


    /* =====================================================
       총 지원금
       ===================================================== */

    const totalSupport =
        totalCompanySupport +
        totalLocalSupport;


    /* =====================================================
       수정/결재 가능 여부
       ===================================================== */

    const canEditable =
        detail?.status === "R" ||
        detail?.status === "H";


    /* =====================================================
       회사 지원금 변경
       ===================================================== */

    const handleCompanySupportChange = (
        itemNo,
        value
    ) => {

        const numericValue =
            value.replace(/[^0-9]/g, "");

        setCompanySupportRows((prev) =>
            prev.map((row) =>
                String(row.itemNo) === String(itemNo)
                    ? {
                        ...row,
                        amount:
                            numericValue === ""
                                ? 0
                                : Number(numericValue)
                    }
                    : row
            )
        );

    };


    /* =====================================================
       회사 지원금 적용
       ===================================================== */

    const handleCompanySupportApply = (item) => {

        if (!canEditable) {
            return;
        }

        const row =
            companySupportRows.find(
                (r) =>
                    String(r.itemNo) ===
                    String(item.itemNo)
            );

        const companyAmount =
            Number(row?.amount) || 0;

        const requestAmount =
            Number(item.itemAmount) || 0;


        if (companyAmount < 0) {

            alert(
                "회사 지원금은 0원 이상이어야 합니다."
            );

            return;
        }


        if (companyAmount > requestAmount) {

            alert(
                `${itemTypeMap[item.itemType] || "비용 항목"}의 회사 지원금은 신청금액을 초과할 수 없습니다.`
            );

            return;
        }


        alert(
            `${itemTypeMap[item.itemType] || "비용 항목"} 회사 지원금이 적용되었습니다.`
        );

    };


    /* =====================================================
       전체 회사 지원금 검증
       ===================================================== */

    const validateCompanySupport = () => {

        const items =
            Array.isArray(detail?.itemList)
                ? detail.itemList
                : [];


        for (const item of items) {

            const row =
                companySupportRows.find(
                    (r) =>
                        String(r.itemNo) ===
                        String(item.itemNo)
                );

            const requestAmount =
                Number(item.itemAmount) || 0;

            const companyAmount =
                Number(row?.amount) || 0;


            if (companyAmount < 0) {

                alert(
                    "회사 지원금은 0원 이상이어야 합니다."
                );

                return false;
            }


            if (companyAmount > requestAmount) {

                alert(
                    `${itemTypeMap[item.itemType] || "비용 항목"}의 회사 지원금은 신청금액을 초과할 수 없습니다.`
                );

                return false;
            }

        }

        return true;
    };


    /* =====================================================
       승인 / 보류 / 반려
       ===================================================== */

    const handleApprovalSubmit = async (
        approvalStatus
    ) => {

        if (!detail) {
            return;
        }


        /* ---------------------------------------------
           현재 상태 확인
           --------------------------------------------- */

        if (!canEditable) {

            alert(
                "현재 결재 처리할 수 없는 상태입니다."
            );

            return;
        }


        /* ---------------------------------------------
           보류 / 반려 사유 필수
           --------------------------------------------- */

        if (
            approvalStatus === "H" ||
            approvalStatus === "J"
        ) {

            if (!comment.trim()) {

                alert(
                    approvalStatus === "H"
                        ? "보류 사유를 입력해주세요."
                        : "반려 사유를 입력해주세요."
                );

                return;
            }

        }


        /* ---------------------------------------------
           승인 시 회사 지원금 검증
           --------------------------------------------- */

        if (approvalStatus === "A") {

            const valid =
                validateCompanySupport();

            if (!valid) {
                return;
            }


            /* -----------------------------------------
               총 지원금 검증
               ----------------------------------------- */

            if (
                totalSupport >
                requestedAmount
            ) {

                alert(
                    `총 지원금이 신청금액을 초과할 수 없습니다.\n\n` +
                    `신청금액: ${formatMoney(requestedAmount)}\n` +
                    `회사 지원금: ${formatMoney(totalCompanySupport)}\n` +
                    `지자체 지원금: ${formatMoney(totalLocalSupport)}\n` +
                    `총 지원금: ${formatMoney(totalSupport)}`
                );

                return;
            }

        }


        /* ---------------------------------------------
           확인 메시지
           --------------------------------------------- */

        let confirmMessage = "";


        if (approvalStatus === "A") {

            confirmMessage =
                `승인하시겠습니까?\n\n` +
                `신청금액: ${formatMoney(requestedAmount)}\n` +
                `회사 지원금: ${formatMoney(totalCompanySupport)}\n` +
                `지자체 지원금: ${formatMoney(totalLocalSupport)}\n` +
                `총 지원금: ${formatMoney(totalSupport)}`;

        } else if (approvalStatus === "H") {

            confirmMessage =
                "해당 비용 신청을 보류 처리하시겠습니까?\n\n" +
                `보류 사유:\n${comment.trim()}`;

        } else if (approvalStatus === "J") {

            confirmMessage =
                "해당 비용 신청을 반려 처리하시겠습니까?\n\n" +
                `반려 사유:\n${comment.trim()}`;

        }


        if (!window.confirm(confirmMessage)) {
            return;
        }


        /* ---------------------------------------------
           API 호출
           --------------------------------------------- */

        try {

            console.log(
                "===== 비용 결재 처리 ====="
            );

            console.log(
                "amountNo:",
                detail.amountNo
            );

            console.log(
                "status:",
                approvalStatus
            );

            console.log(
                "companySupport:",
                totalCompanySupport
            );

            console.log(
                "localSupport:",
                totalLocalSupport
            );


            await amountApi.updateApproval(
                detail.amountNo,
                approvalStatus,
                approvalStatus === "A"
                    ? totalCompanySupport
                    : 0,
                comment.trim()
            );


            /* -----------------------------------------
               완료 메시지
               ----------------------------------------- */

            if (approvalStatus === "A") {

                alert(
                    "승인이 완료되었습니다."
                );

            } else if (approvalStatus === "H") {

                alert(
                    "보류 처리가 완료되었습니다."
                );

            } else if (approvalStatus === "J") {

                alert(
                    "반려 처리가 완료되었습니다."
                );

            }


            /* -----------------------------------------
               목록 이동
               ----------------------------------------- */

            navigate(
                "/admin/cost/list"
            );


        } catch (error) {

            console.error(
                "❌ 결재 처리 실패:",
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
                error.response?.data?.message ||
                "결재 처리 중 오류가 발생했습니다."
            );

        }

    };


    /* =====================================================
       Loading
       ===================================================== */

    if (loading) {

        return (
            <div className="amount-container">

                <div className="loading-message">
                    비용 정산 정보를 불러오는 중입니다...
                </div>

            </div>
        );

    }


    /* =====================================================
       데이터 없음
       ===================================================== */

    if (!detail) {

        return (
            <div className="amount-container">

                <div className="empty-message">
                    비용 정산 정보를 찾을 수 없습니다.
                </div>

                <div className="amount-detail-buttons">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/cost/list")
                        }
                    >
                        목록
                    </button>

                </div>

            </div>
        );

    }


    /* =====================================================
       Render
       ===================================================== */

    return (

        <div className="amount-container">

            {/* =================================================
                제목
               ================================================= */}

            <div className="amount-header">

                <h2>
                    비용 정산 상세
                </h2>

                <div className="amount-number">
                    신청번호 #{detail.amountNo}
                </div>

            </div>


            {/* =================================================
                기본 정보
               ================================================= */}

            <div className="amount-section">

                <h3>
                    신청 정보
                </h3>


                <table className="amount-item-table">

                    <tbody>

                        <tr>

                            <th>
                                신청번호
                            </th>

                            <td>
                                {detail.amountNo}
                            </td>

                            <th>
                                신청자
                            </th>

                            <td>
                                {detail.empName || "-"}
                            </td>

                        </tr>


                        <tr>

                            <th>
                                워케이션 번호
                            </th>

                            <td>
                                {detail.workcationNo}
                            </td>

                            <th>
                                신청일
                            </th>

                            <td>
                                {formatDate(detail.requestedAt)}
                            </td>

                        </tr>


                        <tr>

                            <th>
                                신청금액
                            </th>

                            <td className="money-cell">
                                {formatMoney(requestedAmount)}
                            </td>

                            <th>
                                상태
                            </th>

                            <td>

                                <span
                                    className={`status-badge ${getStatusClass(detail.status)}`}
                                >
                                    {statusMap[detail.status] ||
                                        detail.status}
                                </span>

                            </td>

                        </tr>


                        <tr>

                            <th>
                                승인금액
                            </th>

                            <td className="money-cell">

                                {detail.approvedAmount != null
                                    ? formatMoney(
                                        detail.approvedAmount
                                    )
                                    : "-"
                                }

                            </td>

                            <th>
                                승인일
                            </th>

                            <td>
                                {formatDate(
                                    detail.approvedAt
                                )}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>


            {/* =================================================
                비용 항목
               ================================================= */}

            <div className="amount-section">

                <h3>
                    비용 항목
                </h3>


                {detail.itemList?.length > 0 ? (

                    <table className="amount-item-table">

                        <thead>

                            <tr>

                                <th>
                                    항목
                                </th>

                                <th>
                                    설명
                                </th>

                                <th>
                                    비용일
                                </th>

                                <th>
                                    신청금액
                                </th>

                                <th>
                                    회사 지원금
                                </th>

                                {canEditable && (
                                    <th>
                                        적용
                                    </th>
                                )}

                            </tr>

                        </thead>


                        <tbody>

                            {detail.itemList.map(
                                (item) => {

                                    const row =
                                        companySupportRows.find(
                                            (r) =>
                                                String(r.itemNo) ===
                                                String(item.itemNo)
                                        );


                                    const companyAmount =
                                        Number(row?.amount) || 0;


                                    return (

                                        <tr
                                            key={item.itemNo}
                                        >

                                            <td>
                                                {
                                                    itemTypeMap[
                                                        item.itemType
                                                    ] ||
                                                    item.itemType
                                                }
                                            </td>


                                            <td>
                                                {
                                                    item.itemDescription ||
                                                    "-"
                                                }
                                            </td>


                                            <td>
                                                {formatDate(
                                                    item.itemDate
                                                )}
                                            </td>


                                            <td className="money-cell">
                                                {formatMoney(
                                                    item.itemAmount
                                                )}
                                            </td>


                                            <td>

                                                {canEditable ? (

                                                    <input
                                                        type="text"
                                                        className="amount-input"
                                                        value={
                                                            companyAmount
                                                                .toLocaleString(
                                                                    "ko-KR"
                                                                )
                                                        }
                                                        onChange={(e) =>
                                                            handleCompanySupportChange(
                                                                item.itemNo,
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                ) : (

                                                    <span className="money-cell">
                                                        {formatMoney(
                                                            item.itemApprovedAmount
                                                        )}
                                                    </span>

                                                )}

                                            </td>


                                            {canEditable && (

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn-small"
                                                        onClick={() =>
                                                            handleCompanySupportApply(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        적용
                                                    </button>

                                                </td>

                                            )}

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                ) : (

                    <div className="empty-message">
                        등록된 비용 항목이 없습니다.
                    </div>

                )}

            </div>


            {/* =================================================
                회사 지원금
               ================================================= */}

            <div className="amount-section">

                <h3>
                    회사 지원금
                </h3>


                <div className="amount-summary">

                    <span>
                        회사 지원금
                    </span>

                    <strong>
                        {formatMoney(
                            totalCompanySupport
                        )}
                    </strong>

                </div>

            </div>


            {/* =================================================
                지자체 지원금
                DB amount_list 조회 전용
               ================================================= */}

            <div className="amount-section">

                <h3>
                    지자체 지원금
                </h3>


                {supportList.length > 0 ? (

                    <table className="amount-item-table">

                        <thead>

                            <tr>

                                <th>
                                    지원기관
                                </th>

                                <th>
                                    신청 지원금
                                </th>

                                <th>
                                    승인 지원금
                                </th>

                                <th>
                                    지급일
                                </th>

                                <th>
                                    상태
                                </th>

                                <th>
                                    비고
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {supportList.map(
                                (support) => (

                                    <tr
                                        key={
                                            support.supportNo
                                        }
                                    >

                                        <td>
                                            {
                                                support.sponsorName ||
                                                "-"
                                            }
                                        </td>


                                        <td className="money-cell">
                                            {formatMoney(
                                                support.requestAmount
                                            )}
                                        </td>


                                        <td className="money-cell">
                                            {formatMoney(
                                                support.approvedAmount
                                            )}
                                        </td>


                                        <td>
                                            {formatDate(
                                                support.paymentDate
                                            )}
                                        </td>


                                        <td>

                                            {support.status ===
                                                "PAID"
                                                ? "지급완료"
                                                : support.status ===
                                                    "HOLD"
                                                    ? "보류"
                                                    : "미지급"
                                            }

                                        </td>


                                        <td>
                                            {
                                                support.remark ||
                                                "-"
                                            }
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                ) : (

                    <div className="empty-message">
                        등록된 지자체 지원금이 없습니다.
                    </div>

                )}


                <div className="amount-summary">

                    <span>
                        지자체 지원금
                    </span>

                    <strong>
                        {formatMoney(
                            totalLocalSupport
                        )}
                    </strong>

                </div>

            </div>


            {/* =================================================
                지원금 합계
               ================================================= */}

            <div className="amount-section">

                <h3>
                    지원금 합계
                </h3>


                <table className="amount-item-table">

                    <tbody>

                        <tr>

                            <th>
                                신청금액
                            </th>

                            <td className="money-cell">
                                {formatMoney(
                                    requestedAmount
                                )}
                            </td>

                        </tr>


                        <tr>

                            <th>
                                회사 지원금
                            </th>

                            <td className="money-cell">
                                {formatMoney(
                                    totalCompanySupport
                                )}
                            </td>

                        </tr>


                        <tr>

                            <th>
                                지자체 지원금
                            </th>

                            <td className="money-cell">
                                {formatMoney(
                                    totalLocalSupport
                                )}
                            </td>

                        </tr>


                        <tr>

                            <th>
                                총 지원금
                            </th>

                            <td className="money-cell">
                                <strong>
                                    {formatMoney(
                                        totalSupport
                                    )}
                                </strong>
                            </td>

                        </tr>


                        

                    </tbody>

                </table>

            </div>


            {/* =================================================
                관리자 의견
               ================================================= */}

            <div className="amount-section">

                <h3>
                    관리자 의견
                </h3>


                {canEditable ? (

                    <textarea
                        className="admin-comment"
                        value={comment}
                        placeholder="승인 / 보류 / 반려 처리 시 의견을 입력할 수 있습니다."
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                    />

                ) : (

                    <div className="comment-display">

                        {detail.amountComment
                            ? detail.amountComment
                            : "등록된 관리자 의견이 없습니다."
                        }

                    </div>

                )}

            </div>


            {/* =================================================
                버튼
               ================================================= */}

            <div className="amount-detail-buttons">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/cost/list")
                    }
                >
                    목록
                </button>


                {canEditable && (

                    <>

                        <button
                            type="button"
                            className="btn-approval"
                            onClick={() =>
                                handleApprovalSubmit("A")
                            }
                        >
                            승인
                        </button>


                        <button
                            type="button"
                            className="btn-hold"
                            onClick={() =>
                                handleApprovalSubmit("H")
                            }
                        >
                            보류
                        </button>


                        <button
                            type="button"
                            className="btn-reject"
                            onClick={() =>
                                handleApprovalSubmit("J")
                            }
                        >
                            반려
                        </button>

                    </>

                )}

            </div>

        </div>

    );

}

