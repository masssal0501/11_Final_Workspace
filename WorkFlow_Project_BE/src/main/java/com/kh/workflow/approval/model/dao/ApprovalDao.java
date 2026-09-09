package com.kh.workflow.approval.model.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalDao extends JpaRepository<WorkcationInfo, Integer> {

	// 승인 이력 목록 조회
	// 승인 상태가 A인 데이터만 조회
	// 제목 / 내용 / 날짜 검색 가능
	@Query("""
			    SELECT w
			    FROM WorkcationInfo w
			    JOIN FETCH w.employee e

			    WHERE w.approverState = 'A'
			    AND (
			    	:authCode = 'ADMIN'
			    	OR (
			    		:authCode = 'MANAGER'
			    		AND e.depId = :depId
			    	)
			    	OR(
			    		:authCode = 'STAFF'
			    		AND e.empNo = :empNo
			    	)
			    )
			    AND (
			        :keyword IS NULL
			        OR :keyword = ''
			        OR (
			            :searchType = 'workcationTitle'
			            AND w.workcationTitle LIKE CONCAT('%', :keyword, '%')
			        )
			        OR (
			            :searchType = 'workPlan'
			            AND w.workPlan LIKE CONCAT('%', :keyword, '%')
			        )
			    )
			    AND (
			        :startDate IS NULL
			        OR :endDate IS NULL
			        OR (
			            w.startAt >= :startDate
			            AND w.endAt < :endDate
			        )
			    )
			""")
	Page<WorkcationInfo> searchApprovalHistory(@Param("authCode") String authCode, @Param("empNo") Integer empNo,
			@Param("depId") String depId, @Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

	// 승인 대기 목록 조회
	@Query("""
			    SELECT w
			    FROM WorkcationInfo w
			    JOIN FETCH w.employee e

			    WHERE w.approverState NOT IN :excludedStates

			    AND (
			    	:authCode = 'ADMIN'

			    	OR (
			    		:authCode = 'MANAGER'
			    		AND e.depId = :depId
			    		AND e.empNo <> :empNo
			    	)
			    )

			    AND (
			        :status IS NULL
			        OR :status = ''
			        OR w.approverState = :status
			    )
			    AND (
			        :keyword IS NULL
			        OR :keyword = ''
			        OR (
			            :searchType = 'workcationTitle'
			            AND w.workcationTitle LIKE CONCAT('%', :keyword, '%')
			        )
			        OR (
			            :searchType = 'workPlan'
			            AND w.workPlan LIKE CONCAT('%', :keyword, '%')
			        )
			    )
			    AND (
			        :startDate IS NULL
			        OR :endDate IS NULL
			        OR (
			            w.startAt >= :startDate
			            AND w.endAt < :endDate
			        )
			    )
			""")
	Page<WorkcationInfo> searchApprovalQueue(@Param("authCode") String authCode, @Param("empNo") Integer empNo,
			@Param("depId") String depId, @Param("excludedStates") List<String> excludedStates,
			@Param("status") String status, @Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

	// 승인 이력 상세

	@Query("""
			    SELECT w
			    FROM WorkcationInfo w
			    JOIN FETCH w.employee e
			    LEFT JOIN FETCH w.approver a
			    WHERE w.workcationNo = :workcationNo
			    AND w.approverState = 'A'
			""")
	WorkcationInfo findApprovalDetail(@Param("workcationNo") Integer workcationNo);

	// 승인 대기 상세 (BUG-005: findApprovalDetail은 approverState='A'로 제한되어 있어
	// 대기(W)/보류(H)/검토(R) 상태인 건은 조회되지 않는다 - 승인/반려 처리 화면(ApprovalReject.jsx)은
	// 상태와 무관하게 조회 가능해야 하므로 상태 제한이 없는 별도 쿼리를 사용한다.)
	@Query("""
			    SELECT w
			    FROM WorkcationInfo w
			    JOIN FETCH w.employee e
			    LEFT JOIN FETCH w.approver a
			    WHERE w.workcationNo = :workcationNo
			""")
	WorkcationInfo findApprovalQueueDetail(@Param("workcationNo") Integer workcationNo);

}