package com.kh.workflow.approval.model.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalService {
	
	Page<WorkcationInfo> selectApprovalList(Pageable pageable);

	WorkcationInfo selectApproval(int workcationNo);

	WorkcationInfo rejectApproval(WorkcationInfo w);

	Page<WorkcationInfo> selectApprovalQueueList(Pageable pageable);

}
