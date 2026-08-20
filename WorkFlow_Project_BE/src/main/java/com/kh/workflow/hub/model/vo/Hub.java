package com.kh.workflow.hub.model.vo;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
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

@Schema(description="거점 엔티티")

@Entity
@Table(name="HUB")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Hub {
	
	@Schema(description="거점 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="HUB_NO")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int hubNo;
	
	@Schema(description="지역", example="강원도", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="REGION_NAME", length=20, nullable=false)
	private String regionName;
	
	@Schema(description="거점 이름", example="디어먼데이 춘천", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="HUB_NAME", length=20, nullable=false)
	private String hubName;
	
	@Schema(description="거점 주소", example="강원 춘천시 남산면 방하리 198-1")
	@Column(name="HUB_ADDRESS", length=100)
	private String hubAddress;
	
	@Schema(description="전화번호", example="010-1234-5678")
	@Column(name="PHONE", length=13)
	private String phone;
	
	@Schema(description="상세설명", example="디어먼데이 춘천 남이섬 호텔 정관루점은 한옥의 아름다움과 현대적인 감각이 조화를 이루는 곳입니다.")
	@Column(name="DESCRIPTION", length=300)
	private String description;
	
	@Schema(description="시설", example="1", allowableValues= {"1", "2", "3"})
	@Column(name="HUB_TYPE", columnDefinition="INT")
	private int hubType;
}