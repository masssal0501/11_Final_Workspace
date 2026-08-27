package com.kh.workflow.workcation.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	List<String> findDistinctMainRegions();

	List<String> findDistinctSubRegionsByMainRegion(String mainRegion);

}
