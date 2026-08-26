package com.kh.workflow.place.model.vo;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="HUB")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Place {
	
	@Id
	@Column(name="HUB_NO")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int hubNo;
	
	@Column(name="MAIN_REGION", nullable=false, length=20)
	private String mainRegion;
	
	@Column(name="SUB_REGION", nullable=false, length=20)
	private String subRegion;
	
	@Column(name="HUB_NAME", nullable=false, length=20)
	private String hubName;
	
	@Column(name="HUB_ADDRESS", nullable=true, length=100)
	private String hubAddress;
	
	@Column(name="PHONE", nullable=true, length=13)
	private String phone;
	
	@Column(name="DESCRIPTION", nullable=true, length=300)
	private String description;
	
	@Column(name="HUB_TYPE", nullable=false)
	private int hubType;
	
	@Column(name="MAX_CAPACITY")
	private Integer maxCapacity;
		
	@Column(name="PRICE")
	private Integer price;
	
	@Column(name="HUB_STATUS", columnDefinition="VARCHAR(10) DEFAULT 'OPEN'")
	private String hubStatus;	

}
