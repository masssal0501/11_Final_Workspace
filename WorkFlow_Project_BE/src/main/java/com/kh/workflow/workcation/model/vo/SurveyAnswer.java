package com.kh.workflow.workcation.model.vo;

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

@Entity
@Table(name="survey_answer")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class SurveyAnswer {
	
	@Schema(description="답변 번호", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="answer_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int answerNo;
	
	@Schema(description="응답 내용")
	@Column(name="answer_value", length=200)
	private String answerValue;
	
	// SQL상 score는 NULL 허용(TEXT형 질문은 평점이 없음) - 기존 통계 쿼리
	// (WorkcationDao.selectAvgSatisfaction)가 AVG(s.score)로 평균을 내므로
	// primitive int(기본값 0)를 쓰면 TEXT 답변까지 0점으로 잡혀 평균이 왜곡된다.
	@Schema(description="평점")
	@Column(name="score")
	private Integer score;
	
	@ManyToOne
	@JoinColumn(name="survey_no", nullable=false)
	private WorkcationSurvey workcationSurvey;
	
	@ManyToOne
	@JoinColumn(name="question_no", nullable=false)
	private SurveyQuestion surveyQuestion;
}