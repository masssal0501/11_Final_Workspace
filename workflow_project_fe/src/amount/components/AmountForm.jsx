import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { amountApi } from "../api/amountApi";
import "../styles/AmountStyle.css";


// =========================================================
// 비용 항목
// =========================================================
const ITEM_TYPES = [
    { value: "S", label: "숙박" },
    { value: "T", label: "교통" },
    { value: "E", label: "체험" },
    { value: "F", label: "식비" },
    { value: "V", label: "차량" },
    { value: "O", label: "기타" }
];


export default function AmountForm() {

    const navigate = useNavigate();
    const { amountNo } = useParams();

    const isEditMode = Boolean(amountNo);


    // =========================================================
    // 기본 상태
    // =========================================================

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditMode);

    const [status, setStatus] = useState("R");

    const [amountComment, setAmountComment] = useState("");


    // =========================================================
    // 비용 항목
    // =========================================================

    const [itemList, setItemList] = useState([
        {
            itemNo: null,
            itemType: "S",
            itemAmount: "",
            itemDate: "",
            itemDescription: ""
        }
    ]);


    // =========================================================
    // 파일
    // =========================================================

    const [files, setFiles] = useState([]);


    // =========================================================
    // 수정 화면 기존 파일
    // =========================================================

    const [existingFiles, setExistingFiles] = useState([]);


    // =========================================================
    // 기존 비용 조회
    // =========================================================

    useEffect(() => {

        if (!isEditMode) {
            setPageLoading(false);
            return;
        }

        loadAmount();

    }, [amountNo, isEditMode]);


    // =========================================================
    // 비용 상세 조회
    // =========================================================

    const loadAmount = async () => {

        try {

            setPageLoading(true);

            const data =
                await amountApi.getAmountById(amountNo);

            if (!data) {
                alert("비용 신청 정보를 찾을 수 없습니다.");
                navigate("/cost/list");
                return;
            }


            // -------------------------------------------------
            // 수정 가능 상태 확인
            // R = 검토중
            // H = 보류
            // -------------------------------------------------

            if (
                data.status !== "R" &&
                data.status !== "H"
            ) {

                alert(
                    "검토중 또는 보류 상태의 비용만 수정할 수 있습니다."
                );

                navigate("/cost/list");
                return;
            }


            setStatus(data.status || "R");

            setAmountComment(
                data.amountComment || ""
            );


            // -------------------------------------------------
            // 비용 항목
            // -------------------------------------------------

            if (
                Array.isArray(data.itemList) &&
                data.itemList.length > 0
            ) {

                const loadedItems =
                    data.itemList.map((item) => ({

                        itemNo:
                            item.itemNo ?? null,

                        itemType:
                            item.itemType || "S",

                        itemAmount:
                            item.itemAmount ??
                            item.amount ??
                            "",

                        itemDate:
                            item.itemDate
                                ? String(item.itemDate).substring(0, 10)
                                : "",

                        itemDescription:
                            item.itemDescription || ""

                    }));

                setItemList(loadedItems);

            } else {

                setItemList([
                    {
                        itemNo: null,
                        itemType: "S",
                        itemAmount: "",
                        itemDate: "",
                        itemDescription: ""
                    }
                ]);

            }


            // -------------------------------------------------
            // 기존 첨부파일
            // -------------------------------------------------

            if (
                Array.isArray(data.amountFile)
            ) {

                setExistingFiles(
                    data.amountFile
                );

            } else if (
                Array.isArray(data.fileList)
            ) {

                setExistingFiles(
                    data.fileList
                );

            } else {

                setExistingFiles([]);

            }


            /*
             * =================================================
             * 중요
             * =================================================
             *
             * 지자체지원금은 여기서 가져오지 않는다.
             *
             * 신청 Form에서는 입력하지 않는다.
             *
             * 수정 Form에서도 supportList를 state로 만들지 않는다.
             *
             * DB의 amount_list는 별도로 관리되는 지원금 데이터이며,
             * 목록/상세 조회에서 backend가 읽어서 내려준다.
             *
             * =================================================
             */

        } catch (error) {

            console.error(
                "비용 상세 조회 실패:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "비용 신청 정보를 불러오지 못했습니다."
            );

            navigate("/cost/list");

        } finally {

            setPageLoading(false);

        }
    };


    // =========================================================
    // 항목 추가
    // =========================================================

    const addItem = () => {

        setItemList((prev) => [

            ...prev,

            {
                itemNo: null,
                itemType: "S",
                itemAmount: "",
                itemDate: "",
                itemDescription: ""
            }

        ]);

    };


    // =========================================================
    // 항목 삭제
    // =========================================================

    const removeItem = (index) => {

        if (itemList.length === 1) {

            alert(
                "비용 항목은 최소 1개 이상 필요합니다."
            );

            return;
        }

        setItemList((prev) =>
            prev.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    };


    // =========================================================
    // 항목 수정
    // =========================================================

    const updateItem = (
        index,
        field,
        value
    ) => {

        setItemList((prev) => {

            const next =
                [...prev];

            next[index] = {
                ...next[index],
                [field]: value
            };

            return next;

        });

    };


    // =========================================================
    // 금액 숫자 변환
    // =========================================================

    const parseAmount = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const number =
            Number(
                String(value)
                    .replace(/,/g, "")
            );

        return Number.isFinite(number)
            ? number
            : 0;
    };


    // =========================================================
    // 전체 신청금액
    // =========================================================

    const getRequestedAmount = () => {

        return itemList.reduce(
            (total, item) =>
                total +
                parseAmount(item.itemAmount),
            0
        );

    };


    // =========================================================
    // 파일 선택
    // =========================================================

    const handleFileChange = (event) => {

        const selectedFiles =
            Array.from(
                event.target.files || []
            );

        setFiles(selectedFiles);

    };


    // =========================================================
    // 제출
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (loading) {
            return;
        }


        // -----------------------------------------------------
        // 항목 검증
        // -----------------------------------------------------

        if (
            !Array.isArray(itemList) ||
            itemList.length === 0
        ) {

            alert(
                "비용 항목을 최소 1개 이상 입력해주세요."
            );

            return;
        }


        for (
            let index = 0;
            index < itemList.length;
            index++
        ) {

            const item =
                itemList[index];


            if (!item.itemType) {

                alert(
                    `${index + 1}번째 비용 항목의 유형을 선택해주세요.`
                );

                return;
            }


            if (
                parseAmount(item.itemAmount) <= 0
            ) {

                alert(
                    `${index + 1}번째 비용 항목의 금액을 입력해주세요.`
                );

                return;
            }


            if (!item.itemDate) {

                alert(
                    `${index + 1}번째 비용 항목의 비용 날짜를 입력해주세요.`
                );

                return;
            }

        }


        // -----------------------------------------------------
        // 신청금액
        // -----------------------------------------------------

        const requestedAmount =
            getRequestedAmount();


        if (requestedAmount <= 0) {

            alert(
                "신청 금액을 확인해주세요."
            );

            return;
        }


        // -----------------------------------------------------
        // 신규 신청 시 영수증 필수
        // -----------------------------------------------------

        if (
            !isEditMode &&
            files.length === 0
        ) {

            alert(
                "영수증 파일을 첨부해주세요."
            );

            return;
        }


        try {

            setLoading(true);


            const formData =
                new FormData();


            // =================================================
            // amount
            // =================================================

            formData.append(
                "requestedAmount",
                requestedAmount
            );

            formData.append(
                "amountComment",
                amountComment || ""
            );


            // =================================================
            // amount_item
            // =================================================

            itemList.forEach(
                (item, index) => {

                    formData.append(
                        `itemList[${index}].itemType`,
                        item.itemType
                    );

                    formData.append(
                        `itemList[${index}].itemAmount`,
                        parseAmount(
                            item.itemAmount
                        )
                    );

                    formData.append(
                        `itemList[${index}].itemDate`,
                        item.itemDate
                    );

                    formData.append(
                        `itemList[${index}].itemDescription`,
                        item.itemDescription || ""
                    );

                    /*
                     * 기존 itemNo는 수정 시에도 굳이 전송하지 않는다.
                     *
                     * Backend에서 기존 상세 항목을 삭제한 후
                     * 현재 화면의 항목을 다시 등록하는 방식으로 처리한다.
                     */
                }
            );


            // =================================================
            // 지자체지원금
            // =================================================
            //
            // 절대로 보내지 않는다.
            //
            // supportList
            // sponsorName
            // sponsorAmount
            // amount_list
            // paymentDate
            //
            // 전부 신청자가 입력하지 않는다.
            //
            // DB에 이미 존재하는 amount_list 데이터를
            // 목록/상세 조회 API에서 가져온다.
            //
            // =================================================


            // =================================================
            // 첨부파일
            // =================================================

            files.forEach(
                (file) => {

                    formData.append(
                        "file",
                        file
                    );

                }
            );


            // =================================================
            // 신규 / 수정
            // =================================================

            if (isEditMode) {

                await amountApi.updateAmount(
                    amountNo,
                    formData
                );

                alert(
                    "비용 신청이 수정되었습니다."
                );

            } else {

                await amountApi.insertAmount(
                    formData
                );

                alert(
                    "비용 신청이 등록되었습니다."
                );

            }


            navigate("/cost/list");

        } catch (error) {

            console.error(
                "비용 신청 처리 실패:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "비용 신청 처리 중 오류가 발생했습니다."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // 취소
    // =========================================================

    const handleCancel = () => {

        if (loading) {
            return;
        }

        navigate("/cost/list");

    };


    // =========================================================
    // 로딩
    // =========================================================

    if (pageLoading) {

        return (

            <div className="amount-container">

                <div className="amount-loading">
                    비용 신청 정보를 불러오는 중입니다...
                </div>

            </div>

        );

    }


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="amount-container">

            <div className="amount-form-wrapper">


                {/* =================================================
                    제목
                ================================================= */}

                <div className="amount-page-header">

                    <h2>
                        {isEditMode
                            ? "비용 정산 수정"
                            : "비용 정산 신청"
                        }
                    </h2>

                    <p>
                        {isEditMode
                            ? "비용 신청 내용을 수정합니다."
                            : "워크케이션 중 발생한 비용을 신청합니다."
                        }
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="amount-form"
                >


                    {/* =================================================
                        비용 항목
                    ================================================= */}

                    <section className="amount-section">

                        <div className="amount-section-header">

                            <h3>
                                비용 항목
                            </h3>

                            <button
                                type="button"
                                className="amount-add-button"
                                onClick={addItem}
                            >
                                + 항목 추가
                            </button>

                        </div>


                        {itemList.map(
                            (item, index) => (

                                <div
                                    className="amount-item-card"
                                    key={
                                        item.itemNo ||
                                        `new-${index}`
                                    }
                                >


                                    <div className="amount-item-header">

                                        <strong>
                                            비용 항목 {index + 1}
                                        </strong>


                                        {itemList.length > 1 && (

                                            <button
                                                type="button"
                                                className="amount-remove-button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                            >
                                                삭제
                                            </button>

                                        )}

                                    </div>


                                    {/* ---------------------------------
                                        항목 유형
                                    --------------------------------- */}

                                    <div className="amount-form-row">

                                        <label>
                                            비용 유형
                                        </label>

                                        <select
                                            value={
                                                item.itemType
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "itemType",
                                                    e.target.value
                                                )
                                            }
                                        >

                                            {ITEM_TYPES.map(
                                                (type) => (

                                                    <option
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* ---------------------------------
                                        금액
                                    --------------------------------- */}

                                    <div className="amount-form-row">

                                        <label>
                                            신청 금액
                                        </label>

                                        <div className="amount-input-with-unit">

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    item.itemAmount
                                                }
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "itemAmount",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="금액을 입력하세요"
                                            />

                                            <span>
                                                원
                                            </span>

                                        </div>

                                    </div>


                                    {/* ---------------------------------
                                        날짜
                                    --------------------------------- */}

                                    <div className="amount-form-row">

                                        <label>
                                            비용 날짜
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                item.itemDate
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "itemDate",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* ---------------------------------
                                        설명
                                    --------------------------------- */}

                                    <div className="amount-form-row">

                                        <label>
                                            상세 내용
                                        </label>

                                        <textarea
                                            value={
                                                item.itemDescription
                                            }
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "itemDescription",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="비용 사용 내용을 입력하세요."
                                            rows={4}
                                        />

                                    </div>

                                </div>

                            )
                        )}

                    </section>


                    {/* =================================================
                        신청 금액 합계
                    ================================================= */}

                    <section className="amount-summary-section">

                        <div className="amount-summary-row">

                            <span>
                                총 신청 금액
                            </span>

                            <strong>
                                {getRequestedAmount().toLocaleString("ko-KR")}
                                원
                            </strong>

                        </div>

                    </section>


                    {/* =================================================
                        지자체 지원금 안내
                    ================================================= */}

                    <section className="amount-section">

                        <div className="amount-section-header">

                            <h3>
                                지자체 지원금
                            </h3>

                        </div>

                        <div className="amount-db-info">

                            <p>
                                지자체 지원금은 신청자가 입력하지 않습니다.
                            </p>

                            <p>
                                지원금이 등록된 경우 DB의 지원금 정보를
                                비용 목록 및 상세 화면에서 자동으로 표시합니다.
                            </p>

                        </div>

                    </section>


                    {/* =================================================
                        신청자 의견
                    ================================================= */}

                    <section className="amount-section">

                        <div className="amount-section-header">

                            <h3>
                                신청자 의견
                            </h3>

                        </div>

                        <textarea
                            value={amountComment}
                            onChange={(e) =>
                                setAmountComment(
                                    e.target.value
                                )
                            }
                            placeholder="관리자에게 전달할 내용을 입력하세요."
                            rows={5}
                        />

                    </section>


                    {/* =================================================
                        영수증
                    ================================================= */}

                    <section className="amount-section">

                        <div className="amount-section-header">

                            <h3>
                                영수증 첨부
                            </h3>

                        </div>


                        {isEditMode &&
                            existingFiles.length > 0 && (

                            <div className="amount-existing-files">

                                <p>
                                    기존 첨부파일
                                </p>

                                {existingFiles.map(
                                    (file, index) => (

                                        <div
                                            key={
                                                file.amountFileNo ||
                                                file.amountattachmentNo ||
                                                index
                                            }
                                            className="amount-existing-file"
                                        >
                                            {file.originName ||
                                                file.originalName ||
                                                "첨부파일"}
                                        </div>

                                    )
                                )}

                            </div>

                        )}


                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            multiple
                            onChange={
                                handleFileChange
                            }
                        />


                        {files.length > 0 && (

                            <div className="amount-selected-files">

                                {files.map(
                                    (file, index) => (

                                        <div
                                            key={index}
                                        >
                                            {file.name}
                                        </div>

                                    )
                                )}

                            </div>

                        )}

                        <p className="amount-file-help">

                            {isEditMode
                                ? "새 파일을 선택하면 기존 첨부파일 대신 새 파일이 등록됩니다."
                                : "JPG, PNG, GIF, WEBP / 파일당 최대 10MB"
                            }

                        </p>

                    </section>


                    {/* =================================================
                        버튼
                    ================================================= */}

                    <div className="amount-form-buttons">

                        <button
                            type="button"
                            className="amount-cancel-button"
                            onClick={
                                handleCancel
                            }
                            disabled={loading}
                        >
                            취소
                        </button>


                        <button
                            type="submit"
                            className="amount-submit-button"
                            disabled={loading}
                        >

                            {loading
                                ? "처리 중..."
                                : isEditMode
                                    ? "수정하기"
                                    : "신청하기"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}

