package com.kh.workflow.hub.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.dashboard.model.dto.ChartDataDto;
import com.kh.workflow.dashboard.model.dto.CurrentHubDto;
import com.kh.workflow.hub.model.vo.Hub;

/**
 * 워케이션 거점(Hub) 데이터 접근을 위한 Spring Data JPA Repository 인터페이스
 */
public interface HubDao extends JpaRepository<Hub, Integer> {
	
	/**
     * 시설 유형 목록에 해당하는 거점 목록 조회 (페이징 및 N+1 문제 해결을 위한 첨부파일 즉시 로딩)
     * 
     * @param pageable 페이징 정보
     * @param hubTypes 조회할 시설 유형 번호 목록
     * @return 페이징 처리된 거점 목록
     */
	@EntityGraph(attributePaths = {"hubFileList"})
	Page<Hub> findByHubTypeInOrderByHubNoDesc(Pageable pageable, List<Integer> hubTypes);

	/**
     * 검색 조건(지역, 시설 유형, 키워드)에 따른 거점 목록 조회 (페이징)
     * 
     * @param pageable 페이징 정보
     * @param mainRegion 메인 지역명 (시/도)
     * @param subRegion 상세 지역명 (시/군/구)
     * @param hubTypes 시설 유형 목록
     * @param keyword 거점 이름 검색 키워드
     * @return 검색 조건이 적용된 페이징 처리된 거점 목록
     */
    @EntityGraph(attributePaths = {"hubFileList"})
    @Query("""
    		SELECT h FROM Hub h WHERE
            h.mainRegion LIKE %:mainRegion% AND
            h.subRegion LIKE %:subRegion% AND
            h.hubType IN :hubTypes AND
            h.hubName LIKE %:keyword%
            ORDER BY h.hubNo DESC
            """)
     Page<Hub> searchHubList(
         Pageable pageable,
         @Param("mainRegion") String mainRegion,
         @Param("subRegion") String subRegion,
         @Param("hubTypes") List<Integer> hubTypes,
         @Param("keyword") String keyword
     );

    /**
     * 특정 거점의 운영 상태를 'CLOSED'(중단)로 변경 (논리적 삭제 처리)
     * 
     * @param hubNo 상태를 변경할 거점 번호
     * @return 업데이트 성공 여부에 따른 영향받은 행의 수 (1 이상이면 성공)
     */
    @Modifying
    @Query("""
    			UPDATE Hub h
    			   SET h.hubStatus = 'CLOSED'
    			 WHERE h.hubNo = :hubNo
    			   AND h.hubStatus IN ('OPEN', 'PAUSED')
    		""")
    int deleteHub(@Param("hubNo") int hubNo);

    /**
     * 특정 거점에 작성된 설문조사 평점의 평균 점수 조회
     * 
     * @param hubNo 평균 평점을 조회할 거점 번호
     * @return 해당 거점의 평균 평점 (리뷰나 설문이 없는 경우 0.0 반환)
     */
    @Query("""
            SELECT COALESCE(ROUND(AVG(CAST(sa.answerValue AS double)), 1), 0.0)
              FROM Reservation r
              JOIN r.hub h
              JOIN r.workcation w
              JOIN WorkcationSurvey ws ON ws.workcationInfo = w
              JOIN SurveyAnswer sa ON sa.workcationSurvey = ws
              JOIN sa.surveyQuestion sq
             WHERE h.hubNo = :hubNo
               AND sq.questionType = 'SCORE'
            """)
	double selectAvgScore(@Param("hubNo") int hubNo);
    
    /**
	 * [관리자] 거점 오피스별 점유율 통계 데이터 조회 (차트용)
	 * 허브 타입이 2인 거점 오피스들을 대상으로 지역(mainRegion)별 점유율 백분율을 계산하여 반환합니다.
	 * 
	 * @return List<ChartDataDto> 거점 오피스 지역별 점유율 데이터 목록
	 */
    @Query("""
    		SELECT new com.kh.workflow.dashboard.model.dto.ChartDataDto(
    			h.mainRegion,
    			(COUNT(h) * 100) / (SELECT COUNT(h2) FROM Hub h2 WHERE h2.hubType = 2)
    		)
    		FROM Hub h
    		WHERE h.hubType = 2
    		GROUP BY h.mainRegion
    		""")
    List<ChartDataDto> HubShareData();

	List<Hub> findByMainRegionAndSubRegionAndHubType(String mainRegion, String subRegion, int hubType);

	@Query("SELECT h.mainRegion FROM Hub h")
	List<String> selectMainRegionList();

    // BUG-011: 직원이 워케이션을 2건 이상 신청하면 이 쿼리가 여러 건을 반환해
    // IncorrectResultSizeDataAccessException(500)이 발생했다. "오늘의 근태"에 쓰이는
    // 값이므로 현재 진행 중(승인 + 오늘이 기간 내)인 워케이션 하나로 범위를 좁히고,
    // 그래도 여러 건이 나오는 예외적인 경우를 대비해 List로 받아 서비스에서 첫 값만 사용한다.
    // 근태(출근/퇴근) 체크 시 필요한 workcationNo/hubNo도 함께 반환한다.
    @Query("""
    		SELECT new com.kh.workflow.dashboard.model.dto.CurrentHubDto(w.workcationNo, h.hubNo, h.hubAddress)
    		  FROM Hub h
    		  JOIN Reservation r ON r.hub = h
    		  JOIN WorkcationInfo w ON r.workcation = w
    		  JOIN w.employee e
    		 WHERE e.empNo = :empNo
    		   AND h.hubType = 1
    		   AND w.approverState = 'A'
    		   AND CURRENT_TIMESTAMP BETWEEN w.startAt AND w.endAt
    		""")
	List<CurrentHubDto> selectHubAddress(@Param("empNo") int empNo);

    @Query("SELECT h.subRegion FROM Hub h WHERE h.mainRegion = :mainRegion")
	List<String> selectSubRegionList(@Param("mainRegion") String mainRegion);
}