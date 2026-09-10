package com.kh.workflow.workcation.model.vo;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="workcation_survey")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class WorkcationSurvey {
	
	@Schema(description="설문번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="survey_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int surveyNo;
	
	@Schema(description="작성일시", accessMode=Schema.AccessMode.READ_ONLY, requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="created_at", nullable=false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;
	
	@Schema(description="수정일시", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="updated_at", nullable=false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime updatedAt;
	
	@OneToOne
	@JoinColumn(name="workcation_no", nullable=false)
	private WorkcationInfo workcationInfo;
}