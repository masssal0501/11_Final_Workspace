package com.kh.workflow.survey.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.SurveyQuestion;

public interface SurveyQuestionDao extends JpaRepository<SurveyQuestion, Integer> {

	List<SurveyQuestion> findAllByOrderByQuestionOrderAsc();
}
