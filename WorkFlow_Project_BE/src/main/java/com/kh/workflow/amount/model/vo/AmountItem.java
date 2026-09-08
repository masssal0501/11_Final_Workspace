package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "amount_item")

@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "amount")
public class AmountItem {

    @Schema(description = "항목 번호", accessMode = Schema.AccessMode.READ_ONLY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_no")
    private Integer itemNo;

    @Schema(description = "항목 유형")
    @Column(name = "item_type", length = 15, nullable = false)
    private String itemType;

    @Schema(description = "항목 금액")
    @Column(name = "item_amount", nullable = false)
    private Integer itemAmount;

    @Schema(description = "항목 일자")
    @Column(
        name = "item_date",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime itemDate;

    @Schema(description = "항목 설명")
    @Column(name = "item_description", length = 500)
    private String itemDescription;

    @Schema(description = "비용 정보")
    @JoinColumn(name = "amount_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Amount amount;
}