package com.kh.workflow.workcation.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationService {

	Page<WorkcationInfo> selectWorkcationList(Pageable pageable);

	void insertWorkcationEnroll(Map<String, Object> paramMap);

	

	
	
}
