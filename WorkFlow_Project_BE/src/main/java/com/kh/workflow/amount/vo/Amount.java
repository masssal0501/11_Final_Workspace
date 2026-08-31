package com.kh.workflow.amount.vo;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amount {

    // =========================================================
    // 1. amount
    // =========================================================

    /** amount.amount_no */
    private Integer amountNo;

    /** amount.requested_amount */
    private Integer requestedAmount;

    /** amount.approved_amount */
    private Integer approvedAmount;

    /** amount.requested_at */
    private Date requestedAt;

    /** amount.approved_at */
    private Date approvedAt;

    /** amount.created_at */
    private Date createdAt;

    /** amount.updated_at */
    private Date updatedAt;

    /**
     * A : 승인
     * C : 취소
     * H : 보류
     * J : 반려
     * R : 검토
     */
    private String status;

    /** amount.amount_comment */
    private String amountComment;

    /** amount.workcation_no */
    private Integer workcationNo;

    /** employee.emp_name */
    private String empName;


    // =========================================================
    // 2. amount_item
    // =========================================================

    /**
     * 하나의 정산 신청에 여러 비용 항목이 존재할 수 있음.
     *
     * amount
     *   └─ amount_no
     *        ├─ amount_item 1
     *        ├─ amount_item 2
     *        └─ amount_item 3
     */
    private List<Item> itemList = new ArrayList<>();


    // =========================================================
    // 3. amount_list
    // =========================================================

    /**
     * 하나의 정산에 연결된 지원금 정보.
     *
     * 현재 DB의 amount_list는
     *
     * PRIMARY KEY (amount_no)
     *
     * 이므로 하나의 amount에
     * 하나의 amount_list만 연결할 수 있음.
     */
    private Sponsor sponsor;


    // =========================================================
    // 4. amount_file
    // =========================================================

    /**
     * 하나의 정산에 여러 첨부파일이 존재할 수 있음.
     */
    private List<File> fileList = new ArrayList<>();


    // =========================================================
    // amount_item
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        /** amount_item.item_no */
        private Integer itemNo;

        /**
         * amount_item.amount
         *
         * 비용 항목 금액
         */
        private Integer amount;

        /**
         * amount_item.amountamountitem_type
         *
         * S : 숙박
         * T : 교통
         * E : 체험
         * F : 식비
         * V : 차량
         * O : 기타
         */
        private String itemType;

        /** amount_item.item_date */
        private Date itemDate;

        /**
         * A : 승인
         * C : 취소
         * H : 보류
         * J : 반려
         * R : 검토
         */
        private String itemApproved;

        /** amount_item.item_description */
        private String itemDescription;

        /** amount_item.amount_no */
        private Integer amountNo;
    }


    // =========================================================
    // amount_list
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sponsor {

        /**
         * 현재 DB에는 amount_list_no가 없음.
         *
         * PK는 amount_no.
         */
        /** amount_list.amount_no */
        private Integer amountNo;

        /** amount_list.sponsor_name */
        private String sponsorName;

        /** amount_list.amount */
        private Integer amount;

        /** amount_list.payment_date */
        private Date paymentDate;

        /**
         * PAID   : 지급
         * UNPAID : 미지급
         * HOLD   : 보류
         */
        private String status;

        /** amount_list.remark */
        private String remark;

        /** amount_list.item_no */
        private Integer itemNo;
    }


    // =========================================================
    // amount_file
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class File {

        /** amount_file.amountattachment_no */
        private Integer amountattachmentNo;

        /** amount_file.file_path */
        private String filePath;

        /** amount_file.origin_name */
        private String originName;

        /** amount_file.change_name */
        private String changeName;

        /** amount_file.updated_at */
        private Date updatedAt;

        /**
         * Y : 사용
         * N : 삭제
         */
        private String status;

        /** amount_file.amount_no */
        private Integer amountNo;
    }
}