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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="amount_file")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class AmountFile {

	@Schema(description="첨부파일 번호", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="amount_file_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer amountFileNo;
	
	@Schema(description="파일경로")
	@Column(name="file_path", length=500)
	private String filePath;
	
	@Schema(description="원본 파일명", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="origin_name", length=255, nullable=false)
	private String originName;
	
	@Schema(description="수정된 파일명", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="change_name", length=255, nullable=false)
	private String changeName;
	
	@Schema(description="첨부파일 등록", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;
	
	@Schema(description="파일용량", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="file_size", nullable=false)
	private Long fileSize;
	
	@Schema(description="상태", allowableValues={"Y","N"},defaultValue="Y")
	@Column(name="status", columnDefinition = "VARCHAR(1) DEFAULT 'Y'")
	private String status;
	
	@Schema(description="비용번호", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="amount_no", nullable=false)
	private Integer amountNo;

}

