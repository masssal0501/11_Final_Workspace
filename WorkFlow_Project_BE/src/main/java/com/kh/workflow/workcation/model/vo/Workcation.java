package com.kh.workflow.workcation.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
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
@Table(name = "workcation")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Workcation {

	@Schema(description = "게시글 번호 (자동생성)", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name = "workcation_no")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer workcationNo; // 워케이션번호

	@Schema(description = "제목", requiredMode = Schema.RequiredMode.REQUIRED)
	@Column(name = "workcation_title", length = 200, nullable = false)
	private String workcationTitle;

	@Schema(description = "업무계획", requiredMode = Schema.RequiredMode.REQUIRED)
	@Column(name = "work_plan", length = 300)
	private String workPlan;// 업무계획

	@Schema(description = "작성일(DB자동)", accessMode = Schema.AccessMode.READ_ONLY)
	@Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdTime;// 작성일

	@Schema(description = "수정일", accessMode = Schema.AccessMode.READ_ONLY)
	@Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;// 수정일

	@Schema(description = "워케이션 시작일", accessMode = Schema.AccessMode.READ_ONLY)
	@Column(name = "start_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime startAt;// 워케이션시작일

	@Schema(description = "워케이션 종료일", accessMode = Schema.AccessMode.READ_ONLY)
	@Column(name = "end_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime endAt;// 워케션종료일

	@Schema(description = "결재승인일자", accessMode = Schema.AccessMode.READ_ONLY)
	@Column(name = "approver_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime approvetAt;// 결재 승인 일자

	@Schema(description = "반려사유", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
	@Column(name = "approver_comment", length = 300)
	private String approverComment;// 반려사유

	@Schema(description = "신청상태(A승인, C취소, H보류, J반려, R검토)", 
			allowableValues = { "A", "C", "H", "J", "R", "W" }, defaultValue = "W")
	@Column(name="approver_state", columnDefinition="VARCHAR(1) DEFAULT 'W'")
	private String approverState;// 신청상태
	
	@Schema(description="신청자 번호(사원)", requiredMode = Schema.RequiredMode.REQUIRED)
	@Column(name="emp_no", nullable=false)
	private Integer empNo;// 신청자 번호
	
	@Schema(description="결재자 번호(사원)")
	@Column(name="approver_no")
	private Integer approverNo;// 결재자 번호

}
