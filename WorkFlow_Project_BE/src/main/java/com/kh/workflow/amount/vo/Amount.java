package com.kh.workflow.amount.vo;

import java.math.BigDecimal;
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

    /** amount_no */
    private Integer amountNo;

    /** requested_amount */
    private Integer requestedAmount;

    /** approved_amount */
    private Integer approvedAmount;

    /** requested_at */
    private Date requestedAt;

    /** approved_at */
    private Date approvedAt;

    /** created_at */
    private Date createdAt;

    /** updated_at */
    private Date updatedAt;

    /**
     * A : 승인
     * C : 취소
     * H : 보류
     * J : 반려
     * R : 검토
     */
    private String status;

    /** amount_comment */
    private String amountComment;

    /** workcation_no */
    private Integer workcationNo;

    /** 신청자 이름 JOIN용 */
    private String empName;


    // =========================================================
    // 2. amount_item
    // =========================================================

    /**
     * 하나의 정산(amount)에 여러 비용 항목이 존재할 수 있음
     *
     * amount.amount_no
     *        ↓
     * amount_item.amount_no
     */
    private List<Item> itemList = new ArrayList<>();


    // =========================================================
    // 3. amount_list
    // =========================================================

    /**
     * 하나의 정산(amount)에 여러 지급/후원 내역이 존재할 수 있음
     *
     * amount.amount_no
     *        ↓
     * amount_list.amount_no
     *
     * ※ amount_list에는 item_no가 없음
     */
    private List<Sponsor> sponsorList = new ArrayList<>();


    // =========================================================
    // 4. amount_file
    // =========================================================

    /**
     * 하나의 정산(amount)에 여러 첨부파일이 존재할 수 있음
     */
    private List<File> fileList = new ArrayList<>();


    // =========================================================
    // amount_item
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        /** item_no */
        private Integer itemNo;

        /**
         * cost
         *
         * DB:
         * DECIMAL(15,2)
         */
        private BigDecimal amount;

        /** item_type */
        private String itemType;

        /** item_date */
        private Date itemDate;

        /**
         * A : 승인
         * C : 취소
         * H : 보류
         * J : 반려
         * R : 검토
         */
        private String itemApproved;

        /** item_description */
        private String itemDescription;

        /** amount_no */
        private Integer amountNo;
    }


    // =========================================================
    // amount_list
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sponsor {

        /** amount_list_no */
        private Integer amountListNo;

        /** sponsor_name */
        private String sponsorName;

        /** amount */
        private Integer amount;

        /** payment_date */
        private Date paymentDate;

        /**
         * PAID   : 지급
         * UNPAID : 미지급
         * HOLD   : 보류
         */
        private String status;

        /** remark */
        private String remark;

        /** amount_no */
        private Integer amountNo;
    }


    // =========================================================
    // amount_file
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class File {

        /** amountattachment_no */
        private Integer amountattachmentNo;

        /** file_path */
        private String filePath;

        /** origin_name */
        private String originName;

        /** change_name */
        private String changeName;

        /** updated_at */
        private Date updatedAt;

        /** Y : 사용 / N : 삭제 */
        private String status;

        /** amount_no */
        private Integer amountNo;
    }
}