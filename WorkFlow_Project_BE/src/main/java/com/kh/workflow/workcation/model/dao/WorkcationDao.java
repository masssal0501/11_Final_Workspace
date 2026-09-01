package com.kh.workflow.workcation.model.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.dashboard.model.dto.ChartDataDto;
import com.kh.workflow.dashboard.model.dto.WaitingListDto;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	// 관리자 대시보드
	// 총 신청 건수
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w
			WHERE EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int countTotalApply();
	
	// 승인 대기
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w WHERE w.approverState = 'W'
			AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int countWaiting();
	
	// 현재 진행중
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w WHERE w.approverState = 'A'
			AND w.startAt <= CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP <= w.endAt
			AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int countInProgress();
	
	// 총 참여 인원
	@Query("""
			SELECT COUNT(DISTINCT w.employee)
			FROM WorkcationInfo w
			WHERE w.approverState = 'A'
			""")
	int countTotalParticipants();

	// 평균 만족도
	@Query("SELECT COALESCE(AVG(s.score), 0.0) FROM SurveyAnswer s")
	double selectAvgSatisfaction();
	
	// 평균 워케이션 기간
	@Query("""
			SELECT AVG(DATEDIFF(w.endAt, w.startAt) + 1)
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			""")
	int selectAvgDuration();
	
	// 워케이션 이용률
	@Query("""
	        SELECT COALESCE(
	            (COUNT(DISTINCT w.employee) * 100) / NULLIF(COUNT(DISTINCT e), 0), 
	        0) 
	        FROM WorkcationInfo w, Employee e
			WHERE approverState = 'A'
	        """)
	int selectUsageRate();
	
	// 승인대기 목록
	@Query("""
		    SELECT NEW com.kh.workflow.dashboard.model.dto.WaitingListDto(e.empName, d.depTitle, h.mainRegion, w.startAt, w.endAt, w.approverState) 
		      FROM WorkcationInfo w 
		      JOIN w.employee e, Department d, Reservation r 
		      JOIN r.hub h 
		     WHERE e.depId = d.depId 
		       AND w = r.workcation 
		       AND w.approverState = 'W' 
		     ORDER BY w.workcationNo DESC
		    """)
	List<WaitingListDto> selectWaitingList();

	// 월별 참가 현황
	@Query("""
	        SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
	            CAST(MONTH(w.startAt) AS string), 
	            1.0 * COUNT(w)
	        )
	          FROM WorkcationInfo w
	         WHERE w.approverState = 'A'
	           AND w.startAt >= :startDate
	         GROUP BY CAST(MONTH(w.startAt) AS string)
	        """)
	List<ChartDataDto> selectMonthlyData(@Param("startDate") LocalDateTime startDate);
	
}