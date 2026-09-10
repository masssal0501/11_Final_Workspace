package com.kh.workflow.survey.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.SurveyAnswer;

public interface SurveyAnswerDao extends JpaRepository<SurveyAnswer, Integer> {

	List<SurveyAnswer> findByWorkcationSurvey_SurveyNo(Integer surveyNo);
}
