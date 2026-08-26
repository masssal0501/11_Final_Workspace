package com.kh.workflow.workcation.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.Workcation;

public interface WorkcationDao extends JpaRepository<Workcation, Integer> {

}
