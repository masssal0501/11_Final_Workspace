package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="amount_support")

@DynamicUpdate
@DynamicInsert

@NoArgsConstructor
@Setter
@Getter
@ToString

public class AmountSupport {
	
	@Schema(description="비용번호", accessMode = Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="amount_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer amountNo;
	
	@Schema(description="사내 복지비용")
	@Column(name="approved_amount")
	private Integer approvedAmount;
	
	@Schema(description="신청 일시", accessMode= Schema.AccessMode.READ_ONLY)
	@Column(name="requested_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime requestedAt;
	
	@Schema(description="승인일시", accessMode= Schema.AccessMode.READ_ONLY)
	@Column(name="approved_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime approvedAt;
	
	@Schema(description="신청서 작성일시", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;
	
	@Schema(description="신청서 수정일시", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;
	
	@Schema(description="승인 상태(A승인, C취소, H보류, J반려, R검토,W대기)")
	@Column(name="status", columnDefinition = "VARCHAR(1) DEFAULT'W'")
	private String status;
	
	@Schema(description="반려사유", requiredMode=Schema.RequiredMode.NOT_REQUIRED)
	@Column(name="amount_comment", length=300)
	private String amountComment;
	
	@Schema(description="워케이션 번호", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="workcation_no", nullable=false)
	private Integer workcationNo;
}
