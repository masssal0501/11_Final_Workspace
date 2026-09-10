package com.kh.workflow.survey.model.service;

import java.util.List;
import java.util.Map;

import com.kh.workflow.survey.model.dto.SurveyAnswerRequest;
import com.kh.workflow.workcation.model.vo.SurveyQuestion;

public interface SurveyService {

	List<SurveyQuestion> getQuestions();

	Map<String, Object> getSurveyStatus(int empNo, Integer workcationNo);

	void submitSurvey(int empNo, Integer workcationNo, List<SurveyAnswerRequest> answers);
}
