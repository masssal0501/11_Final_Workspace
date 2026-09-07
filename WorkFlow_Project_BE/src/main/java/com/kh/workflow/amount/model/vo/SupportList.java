package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;

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
@Table(name="support_list")

@NoArgsConstructor
@Setter
@Getter
@ToString

public class SupportList {
	
	@Id
	@Column(name="support_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer supportNo;
	
	@Column(name="sponsor_name", length=50)
	private String sponsorName;
	
	@Column(name="request_amount", nullable=false)
	private Integer requestAmount;
	
	@Column(name="approved_amount", nullable=false)
	private Integer approvedAmount;
	
	@Column(name="payment_date", nullable=false)
	private LocalDateTime paymentDate;
	
	@Column(name="status", length=10)
	private String status;
	
	@Column(name="remark", length=300)
	private String remark;
	
	@Column(name="transport_supported", length=1, nullable=false)
	private String transportSupported;
	
	@Column(name="other_supported", length=1, nullable=false)
	private String otherSupported;
	
	@JoinColumn(name="amount_no", nullable=false)
	@ManyToOne(fetch = FetchType.LAZY)
	private Amount amount;
}
