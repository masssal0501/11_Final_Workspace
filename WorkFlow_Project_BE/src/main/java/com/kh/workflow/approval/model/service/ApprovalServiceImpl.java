package com.kh.workflow.approval.model.service;

import java.time.LocalDateTime;
import java.util.List;

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

    // 승인 이력 목록 조회
    @Override
    public Page<WorkcationInfo> selectApprovalList(
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        return approvalDao.searchApprovalHistory(
                searchType,
                keyword,
                startDate,
                endDate,
                pageable
        );
    }

    // 승인 이력 상세 조회
    @Override
    public WorkcationInfo selectApproval(int workcationNo) {

        return approvalDao.findApprovalDetail(workcationNo);
    }

    // 반려 처리
    @Override
    public WorkcationInfo rejectApproval(WorkcationInfo w) {

        return approvalDao.save(w);
    }

    // 승인 대기 목록 조회
    @Override
    public Page<WorkcationInfo> selectApprovalQueueList(
            String status,
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        return approvalDao.searchApprovalQueue(
                List.of("A", "C", "J"),
                status,
                searchType,
                keyword,
                startDate,
                endDate,
                pageable
        );
    }

    // 승인 대기 상세 조회
	@Override
	public WorkcationInfo selectQueue(int workcationNo) {
		return approvalDao.findByWorkcationNo(workcationNo);
	}
}