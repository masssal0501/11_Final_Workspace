package com.kh.workflow.workcation.model.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.dashboard.model.dto.ChartDataDto;
import com.kh.workflow.dashboard.model.dto.WaitingListDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	// 관리자 대시보드
	// (이번달)총 신청 건수
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			 WHERE EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountTotalApply();
	
	// (이번달)승인 대기
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w 
			 WHERE w.approverState = 'W'
			   AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountWaiting();
	
	// (이번달)현재 진행중
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP <= w.endAt
			   AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountInProgress();
	
	// 총 참여 인원
	@Query("""
			SELECT COUNT(DISTINCT w.employee)
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			""")
	int countTotalParticipants();

	// 평균 만족도
	@Query("""
			SELECT COALESCE(AVG(s.score), 0.0)
			  FROM SurveyAnswer s
			""")
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
	
	// (관리자)승인대기 목록
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
	List<WaitingListDto> adminSelectWaitingList();
	
	// (관리자)지역별 이용 통계
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
				h.mainRegion,
				(COUNT(w) * 100.0)/ (SELECT COUNT(w2) FROM WorkcationInfo w2 JOIN Reservation r2 ON r2.workcation = w2 WHERE w2.approverState = 'A')
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP
			 GROUP BY h.mainRegion
			""")
	List<ChartDataDto> adminSelectRegionData();

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

	
	// 부서장 대시보드
	// (부서)총 신청 건수
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.depId = :depId
			""")
	int managerCountTotalApply(@Param("depId")String depId);

	// (부서)승인대기
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE w.approverState = 'W'
			   AND e.depId = :depId
			""")
	int managerCountWaiting(@Param("depId")String depId);

	// (부서)현재 진행중
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w 
			  JOIN w.employee e
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP
			   AND CURRENT_TIMESTAMP <= w.endAt
			   AND e.depId = :depId
			""")
	int managerCountInProgress(@Param("depId")String depId);

	// (부서)승인대기 목록
	@Query("""
		    SELECT NEW com.kh.workflow.dashboard.model.dto.WaitingListDto(e.empName, e.depId, h.mainRegion, w.startAt, w.endAt, w.approverState) 
		      FROM WorkcationInfo w 
		      JOIN w.employee e, Reservation r 
		      JOIN r.hub h 
		     WHERE e.depId = :depId
		       AND w = r.workcation 
		       AND w.approverState = 'W'
		     ORDER BY w.workcationNo DESC
		    """)
	List<WaitingListDto> managerSelectWaitingList(@Param("depId")String depId);

	// (부서)지역별 이용 단계
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
				h.mainRegion,
				(COUNT(w) * 100.0)/ (SELECT COUNT(w2) FROM WorkcationInfo w2 JOIN Reservation r2 ON r2.workcation = w2 WHERE w2.approverState = 'A')
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE w.approverState = 'A'
			   AND e.depId = :depId
			 GROUP BY h.mainRegion
			""")
	List<ChartDataDto> managerSelectRegionData(@Param("depId")String depId);

	// 부서 워케이션 목록
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.WorkcationListDto(
				e.empNo,
				w.workcationTitle,
				h.mainRegion,
				h.subRegion,
				w.startAt,
				w.endAt,
				e.empName,
				e.status
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE e.depId = :depId
			""")
	List<WorkcationListDto> managerSelectWorkcationList(@Param("depId")String depId);

	// (검색)부서 워케이션 목록
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.WorkcationListDto(
				e.empNo,
				w.workcationTitle,
				h.mainRegion,
				h.subRegion,
				w.startAt,
				w.endAt,
				e.empName,
				e.status
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE e.depId = :depId
			   AND e.empName LIKE '%'||:keyword||'%'
			   AND w.workcationTitle LIKE '%'||:keyword||'%'
			   AND w.startAt >= :startDate
			   AND w.endAt <= :endDate
			""")
	WorkcationListDto managerSearchWorkcationList(@Param("depId") String depId,
												  @Param("keyword") String keyword,
												  @Param("startDate") LocalDateTime startDate,
												  @Param("endDate") LocalDateTime endDate);

	// 사원 대시보드
	// 워케이션 간 횟수
	@Query("""
			SELECT COUNT(w)
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND w.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= w.startAt
			""")
	int selectWorkcationCount(@Param("empNo") int empNo);

	// 워케이션 진행 여부
	@Query("""
			SELECT COUNT(w) > 0
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND w.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= w.startAt
			   AND w.endAt >= CURRENT_TIMESTAMP
			""")
	boolean existsWorkcation(@Param("empNo") int empNo);

	
	// 나의 워케이션 업무계획
	@Query("""
			SELECT w.workPlan
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND w.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= w.startAt
			   AND w.endAt >= CURRENT_TIMESTAMP
			""")
	String selectWorkcationPlan(int empNo);
	
}