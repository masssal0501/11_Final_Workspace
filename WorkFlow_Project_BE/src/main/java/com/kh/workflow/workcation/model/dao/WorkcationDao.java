package com.kh.workflow.workcation.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	WorkcationInfo findByWorkcationNo(int workcationNo);

}
