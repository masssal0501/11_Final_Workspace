package com.kh.workflow.task.model.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.Work;

public interface WorkDao extends JpaRepository<Work, Integer> {

	Optional<Work> findByWorkcationInfo_WorkcationNo(Integer workcationNo);

}
