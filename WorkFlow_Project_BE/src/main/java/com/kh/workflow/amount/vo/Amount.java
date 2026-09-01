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
     * amount.status
     *
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


    // =========================================================
    // 조회용
    // =========================================================

    /**
     * employee.emp_name
     *
     * amount 조회 시 employee와 JOIN하여 사용
     */
    private String empName;


    // =========================================================
    // amount_item
    // =========================================================

    /**
     * amount 1 : N amount_item
     */
    private List<Item> itemList = new ArrayList<>();


    // =========================================================
    // amount_list
    // =========================================================

    /**
     * amount 1 : N amount_list
     *
     * 주의:
     * amount_list의 PK는 amount_list_no
     * amount_no는 amount를 참조하는 FK
     */
    private List<Sponsor> sponsorList = new ArrayList<>();


    // =========================================================
    // amount_file
    // =========================================================

    /**
     * amount 1 : N amount_file
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

        /** amount_item.amount */
        private Integer amount;

        /**
         * 실제 DB 컬럼명:
         * amountamountitem_type
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
         * amount_item.item_approved
         *
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
         * amount_list.amount_list_no
         *
         * PK
         */
        private Integer amountListNo;

        /**
         * amount_list.amount_no
         *
         * FK -> amount.amount_no
         */
        private Integer amountNo;

        /** amount_list.sponsor_name */
        private String sponsorName;

        /** amount_list.amount */
        private Integer amount;

        /** amount_list.payment_date */
        private Date paymentDate;

        /**
         * amount_list.status
         *
         * PAID   : 지급
         * UNPAID : 미지급
         * HOLD   : 보류
         */
        private String status;

        /** amount_list.remark */
        private String remark;

        /**
         * amount_list.item_no
         *
         * FK -> amount_item.item_no
         *
         * NULL 가능
         */
        private Integer itemNo;
    }


    // =========================================================
    // amount_file
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class File {

        /**
         * amount_file.amountattachment_no
         *
         * PK
         */
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
         * amount_file.status
         *
         * Y : 사용
         * N : 삭제
         */
        private String status;

        /** amount_file.amount_no */
        private Integer amountNo;
    }
}

