package com.kh.workflow.approval.model.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalService {
	
    // 승인 이력 목록 조회
    Page<WorkcationInfo> selectApprovalList(
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    // 승인 이력 상세 조회
	WorkcationInfo selectApproval(int workcationNo);

	// 반려 처리
	WorkcationInfo rejectApproval(WorkcationInfo w);

    // 승인 대기 목록 조회
    Page<WorkcationInfo> selectApprovalQueueList(
            String status,
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

	WorkcationInfo selectQueue(int workcationNo);
}
