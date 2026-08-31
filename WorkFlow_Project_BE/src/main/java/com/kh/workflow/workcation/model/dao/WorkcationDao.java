package com.kh.workflow.workcation.model.dao;

import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Repository
public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {


}
