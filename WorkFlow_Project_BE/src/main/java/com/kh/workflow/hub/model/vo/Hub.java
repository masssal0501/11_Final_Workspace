package com.kh.workflow.hub.model.vo;

import java.util.List;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
	
	@Schema(description="지역명", example="강원도", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="MAIN_REGION", length=20, nullable=false)
	private String mainRegion;
	
	@Schema(description="상세지역명", example="강릉시", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="SUB_REGION", length=20, nullable=false)
	private String subRegion;
	
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
	
	@Schema(description="가격", example="10000")
	@Column(name="PRICE", columnDefinition="INT")
	private int price;
	
	@Schema(description="상태", example="OPEN", allowableValues = {"OPEN", "PAUSED", "CLOSED"})
	@Column(name="HUB_STATUS", length=10)
	private String hubStatus;
	
	@Schema(description="최대수용인원", example="10")
	@Column(name="MAX_CAPACITY", columnDefinition="INT")
	private int maxCapacity;
	
    @JsonIgnoreProperties({"hub"}) // JSON 변환 시 순환 참조 방지
    @OneToMany(mappedBy = "hub")
    private List<HubFile> hubFileList;
    
}