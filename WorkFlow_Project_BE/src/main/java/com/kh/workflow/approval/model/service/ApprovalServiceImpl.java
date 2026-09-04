package com.kh.workflow.approval.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kh.workflow.approval.model.dao.ApprovalDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Service
public class ApprovalServiceImpl implements ApprovalService {

	@Autowired
	private ApprovalDao approvalDao;
	
	@Override
	public Page<WorkcationInfo> selectApprovalList(Pageable pageable) {
		
        // 승인 상태가 A인 데이터만 조회
        return approvalDao.findByApproverState("A", pageable);
	}

	public WorkcationInfo selectApproval(int workcationNo) {

	    return approvalDao.findApprovalDetail(workcationNo);
	}

	@Override
	public WorkcationInfo rejectApproval(WorkcationInfo w) {
		return approvalDao.save(w);
	}

}
