package com.kh.workflow.workcation.model.vo;

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
@Table(name="survey_question")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class SurveyQuestion {
	
	@Schema(description="질문번호", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="question_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int questionNo;
	
	@Schema(description="질문", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="question_content", length=200, nullable=false)
	private String questionContent;
	
	@Schema(description = "질문유형", requiredMode=Schema.RequiredMode.REQUIRED, allowableValues = {"S", "T", "M"})
	@Column(name="question_type", nullable=false)
	private String questionType;
}