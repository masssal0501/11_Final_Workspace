package com.kh.workflow.hub.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 워케이션 거점 첨부파일(HubFile) 정보를 관리하는 JPA 엔티티 클래스
 */
@Schema(description="거점 첨부파일 엔티티")
@Entity
@Table(name="hub_file")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
public class HubFile {

	/** 거점 첨부파일 고유 식별 번호 (PK) */
	@Schema(description="거점 첨부파일 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="hubfile_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int hubfileNo;
	
	/** 서버에 저장된 파일의 상대 경로 */
	@Schema(description="파일 경로", example="/upload/hub")
	@Column(name="file_path", length=500)
	private String filePath;
	
	/** 사용자가 업로드한 원본 파일명 */
	@Schema(description="원본파일이름", example="bono.jpg", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="origin_name", length=255, nullable=false)
	private String originName;
	
	/** 서버에 안전하게 중복 방지 처리되어 저장된 변경 파일명 */
	@Schema(description="수정파일이름", example="2026080411234098765.jpg", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="change_name", length=255, nullable=false)
	private String changeName;
	
	/** 첨부파일 등록 일시 */
	@Schema(description="첨부파일 등록", example="2026-08-24T10:00:00", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="updated_at", nullable=false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;
	
	/** 파일 활성화 상태 여부 (Y: 정상, N: 삭제/비활성화) */
	@Schema(description="상태", example="Y", allowableValues = {"Y", "N"}, defaultValue="Y")
	@Column(name="status", columnDefinition="CHAR(1) DEFAULT 'Y'")
	private String status;
	
	/** 해당 첨부파일이 속한 거점 정보 (N:1 관계) */
	@Schema(description="거점 정보 (Hub 객체)")
	@ManyToOne
	@JoinColumn(name="hub_no", nullable=false)
	@ToString.Exclude
	@JsonIgnore
	private Hub hub;
	
}