package com.kh.workflow.workcation.model.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.WorkcationReview;

public interface WorkcationReviewDao extends JpaRepository<WorkcationReview, Integer> {

    Optional<WorkcationReview> findByWorkcationWorkcationNo(Integer workcationNo);

    boolean existsByWorkcationWorkcationNo(Integer workcationNo);

    List<WorkcationReview> findByEmployeeEmpNoOrderByCreatedAtDesc(Integer empNo);
}
