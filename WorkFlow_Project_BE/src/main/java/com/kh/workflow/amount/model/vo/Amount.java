package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "amount_support")

@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = {
        "itemList",
        "supportList",
        "amountFile"
})
public class Amount {

    // =========================================================
    // 1. amount_support
    // =========================================================

    @Schema(description = "비용번호", accessMode = Schema.AccessMode.READ_ONLY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amount_no")
    private Integer amountNo;

    @Schema(description = "신청 금액")
    @Column(name = "requested_amount")
    private Integer requestedAmount;

    @Schema(description = "승인 금액")
    @Column(name = "approved_amount")
    private Integer approvedAmount;

    @Schema(description = "신청일")
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Schema(description = "승인일")
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Schema(description = "등록일")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Schema(description = "수정일")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * A : 승인
     * C : 취소
     * H : 보류
     * J : 반려
     * R : 검토
     */
    @Schema(
        description = "비용 상태",
        allowableValues = {"A", "C", "H", "J", "R"}
    )
    @Column(name = "status", length = 10, nullable = false)
    private String status;

    @Schema(description = "비용 신청 사유")
    @Column(name = "amount_comment", length = 300)
    private String amountComment;

    @Schema(description = "워케이션 번호")
    @Column(name = "workcation_no", nullable = false)
    private Integer workcationNo;


    // =========================================================
    // 조회용
    // =========================================================

    /**
     * employee.emp_name
     *
     * 조회 시 JOIN하여 사용하는 값
     */
    @Transient
    @Schema(description = "사원명", accessMode = Schema.AccessMode.READ_ONLY)
    private String empName;


    // =========================================================
    // 2. amount_item
    // Amount 1 : N AmountItem
    // =========================================================

    @OneToMany(
        mappedBy = "amount",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<AmountItem> itemList = new ArrayList<>();


    // =========================================================
    // 3. support_list
    // Amount 1 : N SupportList
    // =========================================================

    @OneToMany(
        mappedBy = "amount",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SupportList> supportList = new ArrayList<>();


    // =========================================================
    // 4. amount_file
    // Amount 1 : N AmountFile
    // =========================================================

    @OneToMany(
        mappedBy = "amount",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<AmountFile> amountFile = new ArrayList<>();


    // =========================================================
    // 연관관계 편의 메서드
    // =========================================================

    public void addItem(AmountItem item) {
        itemList.add(item);
        item.setAmount(this);
    }

    public void removeItem(AmountItem item) {
        itemList.remove(item);
        item.setAmount(null);
    }

    public void addSupport(SupportList support) {
        supportList.add(support);
        support.setAmount(this);
    }

    public void removeSupport(SupportList support) {
        supportList.remove(support);
        support.setAmount(null);
    }

    public void addAmountFile(AmountFile file) {
        amountFile.add(file);
        file.setAmount(this);
    }

    public void removeAmountFile(AmountFile file) {
        amountFile.remove(file);
        file.setAmount(null);
    }
}