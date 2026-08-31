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
@Table(name="amount_item")

@NoArgsConstructor
@Setter
@Getter
@ToString
public class AmountItem {

	@Id
	@Column(name="item_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer itemNo;
	
	@Column(name="item_type", length=15, nullable=false)
	private String itemType;
	
	@Column(name="item_amount", nullable=false)
	private Integer itemAmount;
	
	@Column(name="item_date", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime itemDate;
	
	@Column(name="item_decription", length=500)
	private String itemDescription;
	
	@JoinColumn(name="amount_no", nullable=false)
	@ManyToOne(fetch = FetchType.LAZY)
	private Amount amount;
}
