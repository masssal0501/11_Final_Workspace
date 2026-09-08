package com.kh.workflow.workcation.model.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.dashboard.model.dto.ChartDataDto;
import com.kh.workflow.dashboard.model.dto.WaitingListDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	/* =====================================================================
	 * 1. 관리자 대시보드 관련 쿼리
	 * ===================================================================== */
	
	/**
	 * [관리자] 이번 달 전사 총 워케이션 신청 건수 조회
	 * 
	 * @return int 이번 달 생성된 전체 신청 건수
	 */
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			 WHERE EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountTotalApply();
	
	/**
	 * [관리자] 이번 달 승인 대기 중인 워케이션 건수 조회
	 * 
	 * @return int 승인 대기('W') 상태인 신청 건수
	 */
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w 
			 WHERE w.approverState = 'W'
			   AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountWaiting();
	
	/**
	 * [관리자] 이번 달 현재 진행 중인 워케이션 건수 조회
	 * 
	 * @return int 승인('A') 상태이면서 현재 날짜가 시작일과 종료일 사이에 포함되는 건수
	 */
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP <= w.endAt
			   AND EXTRACT(MONTH FROM CURRENT_TIMESTAMP) = EXTRACT(MONTH FROM w.createdAt)
			""")
	int adminCountInProgress();
	
	/**
	 * [관리자] 워케이션에 승인되어 참여한 누적 총 인원수 조회 (중복 제거)
	 * 
	 * @return int 참여 고유 사원 수
	 */
	@Query("""
			SELECT COUNT(DISTINCT w.employee)
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			""")
	int countTotalParticipants();

	/**
	 * [관리자] 전체 설문조사 평균 만족도 점수 조회
	 * 
	 * @return double 평균 점수 (데이터가 없으면 0.0 반환)
	 */
	@Query("""
			SELECT COALESCE(AVG(s.score), 0.0)
			  FROM SurveyAnswer s
			""")
	double selectAvgSatisfaction();
	
	/**
	 * [관리자] 승인된 워케이션의 평균 기간(일 수) 조회
	 * 
	 * @return int 평균 일수
	 */
	@Query("""
			SELECT AVG(DATEDIFF(w.endAt, w.startAt) + 1)
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			""")
	int selectAvgDuration();
	
	/**
	 * [관리자] 전사 임직원 대비 워케이션 이용률(%) 계산
	 * 
	 * @return int 이용률 백분율 값
	 */
	@Query("""
	        SELECT COALESCE(
	            (COUNT(DISTINCT w.employee) * 100) / NULLIF(COUNT(DISTINCT e), 0), 
	        0) 
	        FROM WorkcationInfo w, Employee e
			WHERE approverState = 'A'
	        """)
	int selectUsageRate();
	
	/**
	 * [관리자] 승인 대기 중인 워케이션 목록 조회 (최신순)
	 * 
	 * @return List<WaitingListDto> 관리자 승인 대기 리스트
	 */
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
	
	/**
	 * [관리자] 지역별 워케이션 이용 통계 비율 데이터 조회 (차트용)
	 * 
	 * @return List<ChartDataDto> 지역별 점유율 데이터 목록
	 */
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

	/**
	 * [관리자] 특정 기간 이후의 월별 참가 현황 통계 조회
	 * 
	 * @param startDate 조회 기준 시작 일시
	 * @return List<ChartDataDto> 월별 참가 건수 데이터 목록
	 */
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

	
	/* =====================================================================
	 * 2. 부서장 대시보드 관련 쿼리
	 * ===================================================================== */
	
	/**
	 * [부서장] 특정 부서의 총 워케이션 신청 건수 조회
	 * 
	 * @param depId 부서 아이디
	 * @return int 부서원 전체 신청 건수
	 */
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.depId = :depId
			""")
	int managerCountTotalApply(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서의 승인 대기 중인 건수 조회
	 * 
	 * @param depId 부서 아이디
	 * @return int 부서 내 승인 대기 건수
	 */
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE w.approverState = 'W'
			   AND e.depId = :depId
			""")
	int managerCountWaiting(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서에서 현재 워케이션 진행 중인 인원 수 조회
	 * 
	 * @param depId 부서 아이디
	 * @return int 진행 중인 인원 수
	 */
	@Query("""
			SELECT COUNT(w) 
			  FROM WorkcationInfo w 
			  JOIN w.employee e
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP
			   AND CURRENT_TIMESTAMP <= w.endAt
			   AND e.depId = :depId
			""")
	int managerCountInProgress(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서의 승인 대기 목록 조회 (최신순)
	 * 
	 * @param depId 부서 아이디
	 * @return List<WaitingListDto> 부서 승인 대기 리스트
	 */
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
	List<WaitingListDto> managerSelectWaitingList(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서의 지역별 이용 통계 비율 데이터 조회 (차트용)
	 * 
	 * @param depId 부서 아이디
	 * @return List<ChartDataDto> 부서원 지역 선호도 데이터
	 */
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

	/**
	 * [부서장] 소속 부서원 전체 워케이션 목록 조회
	 * 
	 * @param depId 부서 아이디
	 * @return List<WorkcationListDto> 부서 워케이션 전체 목록
	 */
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

	/**
	 * [부서장] 키워드 및 기간 조건을 포함한 부서 워케이션 목록 검색 조회
	 * 
	 * @param depId 부서 아이디
	 * @param keyword 검색어 (사원명 또는 워케이션 제목)
	 * @param startDate 검색 시작일자
	 * @param endDate 검색 종료일자
	 * @return List<WorkcationListDto> 조건에 부합하는 부서 워케이션 검색 목록
	 */
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
	List<WorkcationListDto> managerSearchWorkcationList(@Param("depId") String depId,
												  @Param("keyword") String keyword,
												  @Param("startDate") LocalDateTime startDate,
												  @Param("endDate") LocalDateTime endDate);

	/* =====================================================================
	 * 3. 사원 대시보드 관련 쿼리
	 * ===================================================================== */
	
	/**
	 * [사원] 특정 사원이 지금까지 완료하거나 참여한 승인된 워케이션 횟수 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 워케이션 이용 횟수
	 */
	@Query("""
			SELECT COUNT(w)
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND w.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= w.startAt
			""")
	int selectWorkcationCount(@Param("empNo") int empNo);

	/**
	 * [사원] 특정 사원의 현재 워케이션 진행 여부 확인
	 * 
	 * @param empNo 사원 번호
	 * @return boolean 진행 중이면 true, 아니면 false
	 */
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

	
	/**
	 * [사원] 현재 진행 중인 워케이션의 업무 계획 내용 조회
	 * 
	 * @param empNo 사원 번호
	 * @return String 업무 계획 텍스트
	 */
	@Query("""
			SELECT w.workPlan
			  FROM WorkcationInfo w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND w.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= w.startAt
			   AND w.endAt >= CURRENT_TIMESTAMP
			""")
	String selectWorkcationPlan(@Param("empNo") int empNo);

	/**
	 * [사원] 특정 사원의 워케이션 예약 리스트 전체 조회
	 * 
	 * @param empNo 사원 번호
	 * @return List<Reservation> 예약 정보 목록
	 */
	@Query("""
			SELECT r
			  FROM Reservation r
			  JOIN r.workcation w
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			""")
	List<Reservation> selectReservationList(@Param("empNo") int empNo);

	/**
	 * [사원] 키워드 및 기간 조건을 포함한 개인 예약 리스트 검색 조회
	 * 
	 * @param empNo 사원 번호
	 * @param keyword 검색어 (허브명 등)
	 * @param startDate 검색 시작일자
	 * @param endDate 검색 종료일자
	 * @return List<Reservation> 조건에 부합하는 예약 검색 목록
	 */
	@Query("""
			SELECT r
			  FROM Reservation r
			  JOIN r.workcation w
			  JOIN w.employee e
			  JOIN r.hub h
			 WHERE e.empNo = :empNo
			   AND h.hubName LIKE '%'||:keyword||'%'
			   AND w.startAt >= :startDate
			   AND w.endAt <= :endDate
			""")
	List<Reservation> staffSearchReservationList(@Param("empNo") int empNo,
												 @Param("keyword") String keyword,
												 @Param("startDate") LocalDateTime startDate,
												 @Param("endDate") LocalDateTime endDate);
	
	// 남훈님 작업 - 이창현 옮김 0908_0929
	@Query(value = "SELECT DISTINCT w FROM WorkcationInfo w " +
            "JOIN Reservation r ON r.workcation = w " +
            "JOIN r.hub h " +
            "WHERE (h.hubType = 1 OR h.hubType = 2) " +
            "AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion) " +
            "AND (:subRegion IS NULL OR h.subRegion = :subRegion) " +
            "ORDER BY w.workcationNo DESC",
    countQuery = "SELECT COUNT(DISTINCT w) FROM WorkcationInfo w " +
                 "JOIN Reservation r ON r.workcation = w " +
                 "JOIN r.hub h " +
                 "WHERE (h.hubType = 1 OR h.hubType = 2) " +
                 "AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion) " +
                 "AND (:subRegion IS NULL OR h.subRegion = :subRegion)")
	Page<WorkcationInfo> searchWorkcationList(
		@Param("mainRegion") String mainRegion,
		@Param("subRegion") String subRegion,
		Pageable pageable);
	
	Page<WorkcationInfo> findByEmployeeEmpNo(int empNo, Pageable pageable);
		
	@Query(
		    value = """
		        SELECT DISTINCT w
		        FROM WorkcationInfo w
		        JOIN Reservation r
		            ON r.workcation = w
		        JOIN r.hub h
		        WHERE w.employee.empNo = :empNo
		          AND (h.hubType = 1 OR h.hubType = 2)
		          AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion)
		          AND (:subRegion IS NULL OR h.subRegion = :subRegion)
		        ORDER BY w.workcationNo DESC
		    """,
		    countQuery = """
		        SELECT COUNT(DISTINCT w)
		        FROM WorkcationInfo w
		        JOIN Reservation r
		            ON r.workcation = w
		        JOIN r.hub h
		        WHERE w.employee.empNo = :empNo
		          AND (h.hubType = 1 OR h.hubType = 2)
		          AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion)
		          AND (:subRegion IS NULL OR h.subRegion = :subRegion)
		    """)
		Page<WorkcationInfo> searchMyWorkcationList(
		        @Param("empNo") int empNo,
		        @Param("mainRegion") String mainRegion,
		        @Param("subRegion") String subRegion,
		        Pageable pageable
		);
	
	Optional<WorkcationInfo> findByWorkcationNoAndEmployeeEmpNo(
	        Integer workcationNo,
	        int empNo
	);
	
}