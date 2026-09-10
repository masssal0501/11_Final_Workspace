package com.kh.workflow.survey.model.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.WorkcationSurvey;

public interface WorkcationSurveyDao extends JpaRepository<WorkcationSurvey, Integer> {

	Optional<WorkcationSurvey> findByWorkcationInfo_WorkcationNo(Integer workcationNo);

	boolean existsByWorkcationInfo_WorkcationNo(Integer workcationNo);
}
