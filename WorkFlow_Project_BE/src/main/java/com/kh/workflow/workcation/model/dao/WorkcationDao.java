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
import com.kh.workflow.dashboard.model.dto.ReservationListDto;
import com.kh.workflow.dashboard.model.dto.WaitingListDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;
import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.Work;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	// BUG-06/BUG-11: 이 파일의 대시보드용 쿼리들은 워케이션 1건에 딸린 모든 Reservation을
	// JOIN한다. WorkcationServiceImpl.getWorkcationDetail()의 기존 로직을 보면 워케이션
	// 1건에는 "메인 거점" 예약이 하나 있고(hubType 1=오피스 또는 2=숙소 중 하나) 나머지는
	// 체험/맛집/관광지 같은 0~N개의 "옵션" 예약이라는 게 원래 데이터 모델이다. 그런데
	// 실제 DB를 확인해보니 일부 워케이션은(수기 시딩 등으로) 오피스/숙소 예약이 동시에
	// 2건 들어가 있는 경우도 있어, 단순히 "hubType IN (1, 2)"로만 걸러도 여전히 워케이션당
	// 최대 2행이 남아 지역/서브지역이 다르면 지역 집계가 부풀려지거나(BUG-06) 목록에 같은
	// 워케이션이 중복 표시(BUG-11)되는 문제가 재현됐다. 정상/비정상 데이터 모두에서 항상
	// 워케이션당 정확히 한 행만 남도록, "메인 거점(hubType 1 또는 2) 예약 중 가장 최근에
	// 생성된 것 하나"만 선택하는 상관 서브쿼리로 대표 거점을 결정한다.
	String PRIMARY_HUB_ONLY = "AND r.rsvNo = (SELECT MAX(r2.rsvNo) FROM Reservation r2 "
			+ "JOIN r2.hub h2 WHERE r2.workcation = w AND h2.hubType IN (1, 2))";

//AND w.approverState ='Y' --> 승인 기능 추가후
	@Query("""
			SELECT w
			FROM WorkcationInfo w
			WHERE w.startAt <= :endOfDay
			AND w.endAt >= :startOfDay

			ORDER BY w.startAt ASC
			""")
	List<WorkcationInfo> findWorkcationByDate(
			@Param("startOfDay") LocalDateTime startOfDay,
			@Param("endOfDay") LocalDateTime endOfDay);

	// searchWorkcationList / findByEmployeeEmpNo 는 origin/main 쪽에도 동일한 메서드가 있어
	// (Reservation 연관관계 매핑에 맞춰 JPQL이 수정된 버전) 아래 main 블록의 것을 사용한다.

	/*
	 * ===================================================================== 1. 관리자
	 * 관리자 대시보드 관련 쿼리
	 * =====================================================================
	 */

	/**
	 * [관리자] 이번 달 전사 총 워케이션 신청 건수 조회
	 * 
	 * @return int 이번 달 생성된 전체 신청 건수
	 */
	@Query("""
			SELECT COUNT(DISTINCT w)
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
			SELECT COUNT(DISTINCT w)
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
			SELECT COUNT(DISTINCT w)
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
	 * 워케이션 1건에 예약(Reservation)이 2건 이상(예: 오피스 거점 + 숙소 거점)
	 * 연결된 경우, Reservation을 JOIN하면 워케이션당 예약 건수만큼 행이 곱해져
	 * 같은 워케이션이 목록에 중복으로 표시되는 버그가 있었다. DISTINCT를 추가해
	 * 워케이션당 정확히 한 행만 반환하도록 수정.
	 * (MySQL은 DISTINCT 사용 시 ORDER BY 표현식이 SELECT 목록에 없으면 거부하므로,
	 * SELECT 목록에 없는 w.workcationNo 대신 이미 프로젝션에 포함된 w.startAt로 정렬한다)
	 *
	 * @return List<WaitingListDto> 관리자 승인 대기 리스트
	 */
	@Query("""
		    SELECT DISTINCT NEW com.kh.workflow.dashboard.model.dto.WaitingListDto(
		    	w.workcationNo,
		    	e.empName, 
		    	d.depTitle, 
		    	CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region, 
		    	w.startAt, 
		    	w.endAt, 
		    	w.approverState)
		      FROM WorkcationInfo w
		      JOIN w.employee e
		      JOIN Reservation r ON r.workcation = w
		      JOIN r.hub h
		      JOIN Department d ON d.depId = e.depId
		     WHERE e.depId = d.depId
		       AND w.approverState IN ('W', 'R', 'H')
		       """ + PRIMARY_HUB_ONLY + """

		     ORDER BY w.startAt DESC
		    """)
	List<WaitingListDto> adminSelectWaitingList();

	/**
	 * [관리자] 지역별 워케이션 이용 통계 비율 데이터 조회 (차트용)
	 *
	 * BUG-06: 분자는 "이미 시작된(startAt <= 오늘)" 승인 건만 세는데 분모는 이 조건이
	 * 없어 아직 시작하지 않은 승인 건까지 포함하고 있었다 - 그런 미래 예정 건이 하나라도
	 * 있으면 지역별 비율 합계가 100%에 못 미치던 원인. 분모도 동일한 조건으로 맞춘다.
	 *
	 * @return List<ChartDataDto> 지역별 점유율 데이터 목록
	 */
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
				CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region,
				(COUNT(DISTINCT w) * 100.0)/ (SELECT COUNT(DISTINCT w2) FROM WorkcationInfo w2 JOIN Reservation r2 ON r2.workcation = w2 WHERE w2.approverState = 'A' AND w2.startAt <= CURRENT_TIMESTAMP)
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			 WHERE w.approverState = 'A'
			   AND w.startAt <= CURRENT_TIMESTAMP
			   """ + PRIMARY_HUB_ONLY + """

			 GROUP BY region
			""")
	List<ChartDataDto> adminSelectRegionData();

	/**
	 * [관리자] 특정 기간 이후의 월별 참가 현황 통계 조회
	 * 
	 * @param startDate 조회 기준 시작 일시
	 * @return List<ChartDataDto> 월별 참가 건수 데이터 목록
	 */
	// BUG: MONTH(DISTINCT ...)는 유효한 JPQL이 아니라(DISTINCT는 집계함수 인자에만 붙일 수 있음)
	// 애플리케이션 기동 시 @Query 파싱 자체가 실패했다. COUNT만 DISTINCT로 중복(Reservation
	// JOIN에 의한 fan-out)을 제거하고 MONTH()는 그룹 기준 컬럼에만 그대로 적용한다.
	//
	// BUG-04: SELECT 목록의 첫 항목이 CAST(...AS string)이라 ORDER BY 1이 문자열 사전식
	// 정렬을 해서(월이 두자리가 되는 순간 "10" < "2") 월 순서가 뒤틀렸다. 그렇다고 SELECT는
	// 문자열로 두고 GROUP BY/ORDER BY만 숫자 표현식(MONTH(w.startAt))으로 바꾸면, MySQL의
	// sql_mode=only_full_group_by 아래에서는 GROUP BY 표현식과 문자적으로 다른 표현식을
	// ORDER BY에 쓰는 것 자체가 거부된다(둘 다 "함수적으로 동일한 값"이어도 SQL 엔진이
	// 문자열 비교로만 판단하기 때문). 이 제약을 SQL 단에서 우회하려 하지 않고, GROUP BY는
	// SELECT와 동일한 표현식으로 유지해 DB 제약을 만족시키되, 실제 "1~12월 순서" 정렬은
	// DB가 아닌 애플리케이션(자바) 레벨에서 문자열을 숫자로 변환해 처리한다.
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
			    CAST(MONTH(w.startAt) AS string),
			    1.0 * COUNT(DISTINCT w)
			)
			  FROM WorkcationInfo w
			 WHERE w.approverState = 'A'
			   AND w.startAt >= :startDate
			 GROUP BY CAST(MONTH(w.startAt) AS string)
			""")
	List<ChartDataDto> selectMonthlyDataUnordered(@Param("startDate") LocalDateTime startDate);

	default List<ChartDataDto> selectMonthlyData(LocalDateTime startDate) {
		List<ChartDataDto> result = selectMonthlyDataUnordered(startDate);
		result.sort(java.util.Comparator.comparingInt(dto -> Integer.parseInt(dto.getName())));
		return result;
	}

	/*
	 * ===================================================================== 2. 부서장
	 * 부서장 대시보드 관련 쿼리
	 * =====================================================================
	 */

	/**
	 * [부서장] 특정 부서의 총 워케이션 신청 건수 조회
	 * 
	 * @param depId 부서 아이디
	 * @return int 부서원 전체 신청 건수
	 */
	@Query("""
			SELECT COUNT(DISTINCT w) FROM WorkcationInfo w
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
			SELECT COUNT(DISTINCT w)
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
			SELECT COUNT(DISTINCT w)
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
		    SELECT DISTINCT NEW com.kh.workflow.dashboard.model.dto.WaitingListDto(
			 	w.workcationNo,
			 	e.empName,
			 	e.depId,
			 	CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region,
			 	w.startAt,
			 	w.endAt,
			 	w.approverState) 
		      FROM WorkcationInfo w 
		      JOIN w.employee e
		      JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
		     WHERE e.depId = :depId
		       AND w.approverState IN ('W', 'R', 'H')
		       """ + PRIMARY_HUB_ONLY + """

		     ORDER BY w.workcationNo DESC
		    """)
	List<WaitingListDto> managerSelectWaitingList(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서의 지역별 이용 통계 비율 데이터 조회 (차트용)
	 *
	 * BUG-06: 분모가 회사 전체(전 부서) 승인 건수로 고정되어 있어, 이 부서의 지역별
	 * 비율 합계가 100%가 아니라 "회사 전체 대비 이 부서의 비중"처럼 나오고 있었다.
	 * 관리자 화면은 회사 전체 기준이 맞지만(HubDao.HubShareData 등), 부서장 화면은
	 * "내 부서 안에서의 지역별 비율"이어야 하므로 분모도 동일하게 이 부서(depId)로 좁힌다.
	 *
	 * @param depId 부서 아이디
	 * @return List<ChartDataDto> 부서원 지역 선호도 데이터
	 */
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ChartDataDto(
				CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region,
				(COUNT(DISTINCT w) * 100.0)/ (SELECT COUNT(DISTINCT w2) FROM WorkcationInfo w2 JOIN Reservation r2 ON r2.workcation = w2 JOIN w2.employee e2 WHERE w2.approverState = 'A' AND e2.depId = :depId)
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE w.approverState = 'A'
			   AND e.depId = :depId
			   """ + PRIMARY_HUB_ONLY + """

			 GROUP BY region
			""")
	List<ChartDataDto> managerSelectRegionData(@Param("depId") String depId);

	/**
	 * [부서장] 소속 부서원 전체 워케이션 목록 조회
	 * 
	 * @param depId 부서 아이디
	 * @return List<WorkcationListDto> 부서 워케이션 전체 목록
	 */
	@Query("""
			SELECT DISTINCT NEW com.kh.workflow.dashboard.model.dto.WorkcationListDto(
				w.workcationNo,
				w.workcationTitle,
				CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region,
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
			   """ + PRIMARY_HUB_ONLY + """

			""")
	List<WorkcationListDto> managerSelectWorkcationList(@Param("depId") String depId);

	/**
	 * [부서장] 키워드 및 기간 조건을 포함한 부서 워케이션 목록 검색 조회
	 * 
	 * @param depId     부서 아이디
	 * @param keyword   검색어 (사원명 또는 워케이션 제목)
	 * @param startDate 검색 시작일자
	 * @param endDate   검색 종료일자
	 * @return List<WorkcationListDto> 조건에 부합하는 부서 워케이션 검색 목록
	 */
	@Query("""
			SELECT DISTINCT NEW com.kh.workflow.dashboard.model.dto.WorkcationListDto(
				w.workcationNo,
				w.workcationTitle,
				CASE WHEN h.mainRegion IN ('제주도', '제주') THEN '제주'
    			     WHEN h.mainRegion IN ('강원도', '강원') THEN '강원'
    			     WHEN h.mainRegion IN ('부산시', '부산') THEN '부산'
    			     ELSE '' END region,
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
			   """ + PRIMARY_HUB_ONLY + """

			   AND (e.empName LIKE '%'||:keyword||'%' OR w.workcationTitle LIKE '%'||:keyword||'%')
			   AND (:startDate IS NULL OR w.endAt >= :startDate)
			   AND (:endDate IS NULL OR  w.startAt <= :endDate)
			   AND (:startDate IS NULL OR :endDate IS NULL OR :startDate < :endDate)
			""")
	List<WorkcationListDto> managerSearchWorkcationList(@Param("depId") String depId, @Param("keyword") String keyword,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	/*
	 * ===================================================================== 3. 사원
	 * 사원 대시보드 관련 쿼리
	 * =====================================================================
	 */

	/**
	 * [사원] 특정 사원이 지금까지 완료하거나 참여한 승인된 워케이션 횟수 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 워케이션 이용 횟수
	 *
	 */

	@Query("""
			SELECT COUNT(DISTINCT w)
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
			SELECT COUNT(DISTINCT w) > 0
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
			SELECT DISTINCT w.workPlan
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
	 * @return List<ReservationListDto> 예약 정보 목록
	 */
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ReservationListDto(
				r.rsvNo,
				h.hubName,
				r.rsvStart,
				r.rsvEnd,
				r.userCapacity,
				r.rsvStatus
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			""")
	List<ReservationListDto> selectReservationList(@Param("empNo") int empNo);

	/**
	 * [사원] 키워드 및 기간 조건을 포함한 개인 예약 리스트 검색 조회
	 * 
	 * @param empNo     사원 번호
	 * @param keyword   검색어 (허브명 등)
	 * @param startDate 검색 시작일자
	 * @param endDate 검색 종료일자
	 * @return List<ReservationListDto> 조건에 부합하는 예약 검색 목록
	 */
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.ReservationListDto(
				r.rsvNo,
				h.hubName,
				r.rsvStart,
				r.rsvEnd,
				r.userCapacity,
				r.rsvStatus
			)
			  FROM WorkcationInfo w
			  JOIN Reservation r ON r.workcation = w
			  JOIN r.hub h
			  JOIN w.employee e
			 WHERE e.empNo = :empNo
			   AND h.hubName LIKE '%'||:keyword||'%'
			   AND (:startDate IS NULL OR r.rsvEnd >= :startDate)
			   AND (:endDate IS NULL OR  r.rsvStart <= :endDate)
			   AND (:startDate IS NULL OR :endDate IS NULL OR :startDate < :endDate)
			""")
	List<ReservationListDto> staffSearchReservationList(@Param("empNo") int empNo,
												 @Param("keyword") String keyword,
												 @Param("startDate") LocalDateTime startDate,
												 @Param("endDate") LocalDateTime endDate);
	
	// 남훈님 작업 - 이창현 옮김 0908_0929
	// BUG: 목록이 권한과 무관하게 항상 전체를 보여주던 문제 수정 - empNo(STAFF 본인 글만)/
	// depId(MANAGER 소속 부서만) 조건을 추가. ADMIN은 둘 다 null로 호출해 전체 조회.
	@Query(value = "SELECT DISTINCT w FROM WorkcationInfo w " + "JOIN Reservation r ON r.workcation = w "
			+ "JOIN r.hub h " + "JOIN w.employee e " + "WHERE (h.hubType = 1 OR h.hubType = 2) "
			+ "AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion) "
			+ "AND (:subRegion IS NULL OR h.subRegion = :subRegion) "
			+ "AND (:empNo IS NULL OR e.empNo = :empNo) "
			+ "AND (:depId IS NULL OR e.depId = :depId) "
			+ "ORDER BY w.workcationNo DESC", countQuery = "SELECT COUNT(DISTINCT w) FROM WorkcationInfo w "
					+ "JOIN Reservation r ON r.workcation = w " + "JOIN r.hub h " + "JOIN w.employee e "
					+ "WHERE (h.hubType = 1 OR h.hubType = 2) "
					+ "AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion) "
					+ "AND (:subRegion IS NULL OR h.subRegion = :subRegion) "
					+ "AND (:empNo IS NULL OR e.empNo = :empNo) "
					+ "AND (:depId IS NULL OR e.depId = :depId)")
	Page<WorkcationInfo> searchWorkcationList(@Param("mainRegion") String mainRegion,
			@Param("subRegion") String subRegion, @Param("empNo") Integer empNo, @Param("depId") String depId,
			Pageable pageable);

	Page<WorkcationInfo> findByEmployeeEmpNo(int empNo, Pageable pageable);

	@Query(value = """
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
			""", countQuery = """
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
	Page<WorkcationInfo> searchMyWorkcationList(@Param("empNo") int empNo, @Param("mainRegion") String mainRegion,
			@Param("subRegion") String subRegion, Pageable pageable);

	Optional<WorkcationInfo> findByWorkcationNoAndEmployeeEmpNo(Integer workcationNo, int empNo);

	@Query("""
		    SELECT DISTINCT w
		    FROM WorkcationInfo w
		    JOIN Work wk ON wk.workcationInfo = w
		    JOIN Task t ON t.work = wk
		    WHERE (:keyword = ''
		        OR LOWER(w.workcationTitle)
		            LIKE LOWER(CONCAT('%', :keyword, '%')))
		    ORDER BY w.workcationNo DESC
		""")
		Page<WorkcationInfo> findTaskBoardList(
		        @Param("keyword") String keyword,
		        Pageable pageable);

}
