package com.kh.workflow.approval.model.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalService {
	
	Page<WorkcationInfo> selectApprovalList(Pageable pageable);

}
