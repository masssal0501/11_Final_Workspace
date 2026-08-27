package com.kh.workflow.workcation.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

}
