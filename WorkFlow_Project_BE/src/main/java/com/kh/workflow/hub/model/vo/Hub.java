package com.kh.workflow.hub.model.vo;

import java.util.List;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 워케이션 거점(hub) 정보를 관리하는 JPA 엔티티 클래스
 */
@Schema(description="거점 엔티티")
@Entity
@Table(name="hub")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@Setter
@Getter
@ToString
public class Hub {
	
	/** 거점 고유 식별 번호 (PK) */
	@Schema(description="거점 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="hub_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int hubNo;
	
	/** 메인 지역명 (시/도) */
	@Schema(description="지역명", example="강원도", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="main_region", length=20, nullable=false)
	private String mainRegion;
	
	/** 상세 지역명 (시/군/구) */
	@Schema(description="상세지역명", example="강릉시", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="sub_region", length=20, nullable=false)
	private String subRegion;
	
	/** 거점 시설 이름 */
	@Schema(description="거점 이름", example="디어먼데이 춘천", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="hub_name", length=20, nullable=false)
	private String hubName;
	
	/** 거점 상세 도로명 주소 */
	@Schema(description="거점 주소", example="강원 춘천시 남산면 방하리 198-1")
	@Column(name="hub_address", length=100)
	private String hubAddress;
	
	/** 거점 연락처 전화번호 */
	@Schema(description="전화번호", example="010-1234-5678")
	@Column(name="phone", length=13)
	private String phone;
	
	/** 거점 상세 설명 및 특징 */
	@Schema(description="상세설명", example="디어먼데이 춘천 남이섬 호텔 정관루점은 한옥의 아름다움과 현대적인 감각이 조화를 이루는 곳입니다.")
	@Column(name="description", length=300)
	private String description;
	
	/** 시설 유형 코드 (예: 1=숙소, 2=공유오피스 등) */
	@Schema(description="시설", example="1", allowableValues= {"1", "2", "3", "4", "5"})
	@Column(name="hub_type", columnDefinition="INT")
	private int hubType;
	
	/** 기본 이용 요금 */
	@Schema(description="가격", example="10000")
	@Column(name="price", columnDefinition="INT")
	private int price;
	
	/** 거점 운영 상태 (OPEN, PAUSED, CLOSED) */
	@Schema(description="상태", example="OPEN", allowableValues = {"OPEN", "PAUSED", "CLOSED"})
	@Column(name="hub_status", length=10)
	private String hubStatus;
	
	/** 최대 수용 인원 */
	@Schema(description="최대수용인원", example="10")
	@Column(name="max_capacity", columnDefinition="INT")
	private int maxCapacity;
	
	/** 거점에 등록된 첨부파일 목록 (1:N 관계) */
    @JsonIgnoreProperties({"hub"}) // JSON 변환 시 순환 참조 방지
    @OneToMany(mappedBy = "hub")
    @OrderBy("hubfileNo ASC")
    private List<HubFile> hubFileList;
    
}