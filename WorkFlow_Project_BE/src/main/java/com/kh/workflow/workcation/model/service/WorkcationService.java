package com.kh.workflow.workcation.model.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.Workcation;

public interface WorkcationService {

	Page<Workcation> selectWorkcationList(Pageable pageable);

	
	
}
