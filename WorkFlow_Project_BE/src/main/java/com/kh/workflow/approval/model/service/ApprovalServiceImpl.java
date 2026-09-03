package com.kh.workflow.approval.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.approval.model.dao.ApprovalDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public class ApprovalServiceImpl implements ApprovalService {

	@Autowired
	private ApprovalDao approvalDao;
	
	@Override
	public Page<WorkcationInfo> selectApprovalList(Pageable pageable) {
		
		return approvalDao.findAll(pageable);
	}

	@Override
	public WorkcationInfo selectApproval(int workcationNo) {
		return approvalDao.findByWorkcationNo(workcationNo);
	}

}
