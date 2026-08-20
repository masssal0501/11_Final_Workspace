package com.kh.workflow.amount.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amount {

    // ===== 1. amount (메인 비용 테이블) =====
    private Integer amountNo;            // amount_no (PK)
    private Integer requestedAmount;     // requested_amount
    private Integer approvedAmount;  // approved_amount (NULL 허용)
    private Date requestedAt;        // requested_at
    private Date approvedAt;         // approved_at (NULL 허용)
    private Date createdAt;          // created_at
    private Date updatedAt;          // updated_at (NULL 허용)
    private String status;           // status (A: 승인, C: 취소, H: 보류, J: 반려, R: 검토)
    private String amountComment;    // amount_comment
    private Integer workcationNo;        // workcation_no (FK)

    // ===== 1:N 자식 리스트 관계 =====
    private List<Item> itemList;     // amount_item 테이블 리스트
    private List<File> fileList;     // amount_file 테이블 리스트
    private String empName; // 사원 이름 (JOIN용)
    // =========================================================
    // 2. amount_item (비용 상세 테이블)
    // =========================================================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private Integer itemNo;              // item_no (PK)
        private String itemType;         // item_type (S, T, E, F, V, O)
        private Date itemDate;           // item_date
        private String itemApproved;     // item_approved
        private String itemDescription;  // item_description
        private Integer amountNo;            // amount_no (FK)

        // ===== 1:N 자식 리스트 관계 =====
        private List<Sponsor> sponsorList; // amount_list 테이블 리스트
    }

    // =========================================================
    // 3. amount_list (지원금/지급 상세 테이블)
    // =========================================================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sponsor {
        private Integer amountNo;       // amount_no (PK / FK) - 📌 이전 에러 방지용 getter/setter 포함
        private String sponsorName; // sponsor_name
        private Integer amount;         // amount
        private Date paymentDate;   // payment_date
        private String status;      // status (PAID, UNPAID, HOLD)
        private String remark;      // remark
        private Integer itemNo;         // item_no (FK)
    }

    // =========================================================
    // 4. amount_file (비용 첨부파일 테이블)
    // =========================================================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class File {
        private Integer amountattachmentNo; // amountattachment_no (PK)
        private String filePath;        // file_path
        private String originName;      // origin_name
        private String changeName;      // change_name
        private Date updatedAt;         // updated_at
        private String status;          // status (Y, N)
        private Integer amountNo;           // amount_no (FK)
    }
}