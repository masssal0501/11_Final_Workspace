package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "support_list")

@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "amount")
public class SupportList {

    @Schema(description = "지원금 번호", accessMode = Schema.AccessMode.READ_ONLY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "support_no")
    private Integer supportNo;

    @Schema(description = "지원 기관명")
    @Column(name = "sponsor_name", length = 50)
    private String sponsorName;

    @Schema(description = "신청 금액")
    @Column(name = "request_amount", nullable = false)
    private Integer requestAmount;

    @Schema(description = "승인 금액")
    @Column(name = "approved_amount", nullable = false)
    private Integer approvedAmount;

    @Schema(description = "지급일")
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Schema(description = "지급 상태")
    @Column(name = "status", length = 10)
    private String status;

    @Schema(description = "비고")
    @Column(name = "remark", length = 300)
    private String remark;

    @Schema(description = "교통비 지원 여부")
    @Column(name = "transport_supported", length = 1, nullable = false)
    private String transportSupported;

    @Schema(description = "기타 지원 여부")
    @Column(name = "other_supported", length = 1, nullable = false)
    private String otherSupported;

    @Schema(description = "비용 정보", hidden = true)
    @JsonIgnore
    @JoinColumn(name = "amount_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Amount amount;
}