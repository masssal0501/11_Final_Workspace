package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.Work;

public interface WorkDao extends JpaRepository<Work, Integer> {

	List<Work> findByWorkcationInfoWorkcationNo(Integer workcationNo);

}
