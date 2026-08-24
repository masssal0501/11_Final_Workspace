package com.kh.workflow.hub.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Schema(description="거점 첨부파일 엔티티")

@Entity
@Table(name="HUB_FILE")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class HubFile {

	@Schema(description="거점 첨부파일 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="HUBFILE_NO")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int hubfileNo;
	
	@Schema(description="파일 경로", example="/upload/hub")
	@Column(name="FILE_PATH", length=500)
	private String filePath;
	
	@Schema(description="원본파일이름", example="bono.jpg", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="ORIGIN_NAME", length=255, nullable=false)
	private String originName;
	
	@Schema(description="수정파일이름", example="2026080411234098765.jpg", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="CHANGE_NAME", length=255, nullable=false)
	private String changeName;
	
	@Schema(description="첨부파일 등록", example="2026-08-24T10:00:00", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="UPDATED_AT", columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;
	
	@Schema(description="상태", example="Y", allowableValues = {"Y", "N"}, defaultValue="Y")
	@Column(name="STATUS", columnDefinition="CHAR(1) DEFAULT 'Y")
	private String status;
	
	@Schema(description="거점 정보 (Hub 객체)")
	@ManyToOne
	@JoinColumn(name="HUB_NO")
	private Hub hub;
	
}