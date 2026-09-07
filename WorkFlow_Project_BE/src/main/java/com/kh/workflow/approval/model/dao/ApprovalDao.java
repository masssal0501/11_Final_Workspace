package com.kh.workflow.approval.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalDao extends JpaRepository<WorkcationInfo, Integer> {

    // 승인 완료된 워케이션만 조회
    Page<WorkcationInfo> findByApproverState(
            String approverState,
            Pageable pageable
    );

    // 승인 이력 상세
    @Query("""
        SELECT w
        FROM WorkcationInfo w
        JOIN FETCH w.employee e
        LEFT JOIN FETCH w.approver a
        WHERE w.workcationNo = :workcationNo
        AND w.approverState = 'A'
    """)
    WorkcationInfo findApprovalDetail(
            @Param("workcationNo") Integer workcationNo
    );

	Page<WorkcationInfo> findByApprovalStateNotIn(List<String> of, Pageable pageable);

}