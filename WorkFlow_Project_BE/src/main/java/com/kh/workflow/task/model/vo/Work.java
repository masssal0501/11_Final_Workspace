package com.kh.workflow.task.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Table(name="work")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Work {
	
	@Schema(description="근무 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="work_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int workNo; // 근무 번호
	
	@Schema(description="근무 제출 시간", example="2026-08-24T10:00:00", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="submitted_at", nullable=false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime submittedAt;
	
	@Schema(description="근무 수정 시간", example="2026-08-24T10:00:00", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="updated_at", columnDefinition="TIMESTAMP")
	private LocalDateTime updatedAt;
	
	@Schema(description="워케이션 내역 정보 (WorkcationInfo 객체)")
	@ManyToOne
	@JoinColumn(name="workcation_no", nullable=false)
	private WorkcationInfo workcationInfo;
}