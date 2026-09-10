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

}