package com.kh.workflow.place.model.dao;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kh.workflow.hub.model.vo.Hub;

@Repository
public interface PlaceDao extends JpaRepository<Hub, Integer> {

    // =========================================================
    // 장소 목록 조회
    // - 체험(3), 맛집(4), 관광지(5)만 조회
    // - 검색 조건이 있으면 해당 조건에 맞는 장소만 조회
    // - Pageable을 이용하여 페이지 단위로 조회
    // =========================================================
    @Query("""
        SELECT h
        FROM Hub h
        WHERE h.hubType IN (3, 4, 5)
          AND (:keyword IS NULL
               OR h.hubName LIKE %:keyword%
               OR h.mainRegion LIKE %:keyword%
               OR h.subRegion LIKE %:keyword%
               OR h.hubAddress LIKE %:keyword%)
          AND (:type IS NULL OR h.hubType = :type)
          AND (:region IS NULL OR h.mainRegion = :region)
          AND (:subRegion IS NULL OR h.subRegion = :subRegion)
        ORDER BY h.hubNo DESC
    """)
    List<Hub> selectFilteredPlaceList(
        @Param("keyword") String keyword,
        @Param("type") Integer type,
        @Param("region") String region,
        @Param("subRegion") String subRegion,
        Pageable pageable
    );


    // =========================================================
    // 장소 전체 개수 조회
    // - 목록 조회와 동일한 검색 조건 적용
    // - 페이지네이션의 전체 페이지 수 계산에 사용
    // =========================================================
    @Query("""
        SELECT COUNT(h)
        FROM Hub h
        WHERE h.hubType IN (3, 4, 5)
          AND (:keyword IS NULL
               OR h.hubName LIKE %:keyword%
               OR h.mainRegion LIKE %:keyword%
               OR h.subRegion LIKE %:keyword%
               OR h.hubAddress LIKE %:keyword%)
          AND (:type IS NULL OR h.hubType = :type)
          AND (:region IS NULL OR h.mainRegion = :region)
          AND (:subRegion IS NULL OR h.subRegion = :subRegion)
    """)
    int selectPlaceCount(
        @Param("keyword") String keyword,
        @Param("type") Integer type,
        @Param("region") String region,
        @Param("subRegion") String subRegion
    );


    // =========================================================
    // 특정 장소 조회
    // - hubNo를 기준으로 장소 상세정보 조회
    // =========================================================
    Hub findByHubNo(int hubNo);
    @Query("""
    		SELECT AVG(sa.score)
    		  FROM Hub h
    		  JOIN Reservation r
    		  	ON r.hub.hubNo = h.hubNo
    		  JOIN WorkcationSurvey ws
    		  	ON ws.workcationInfo.workcationNo = r.workcation.workcationNo
    		  JOIN SurveyAnswer sa
    		  	ON sa.workcationSurvey.surveyNo = ws.surveyNo
    		 WHERE h.hubNo = :hubNo
    		   AND (
    		   		(h.hubType = 3 AND sa.surveyQuestion.questionNo = 4)
    		   		OR
    		   		(h.hubType IN (4, 5) AND sa.surveyQuestion.questionNo = 1)    		   		
    		   )
    		 
    		""")
    		Double findAverageRating(@Param("hubNo") int hubNo);


    // =========================================================
    // 장소 종료 처리
    // - 장소를 실제로 삭제하지 않고 CLOSED 상태로 변경
    // =========================================================
    @Modifying
    @Query("""
        UPDATE Hub
        SET hubStatus = 'CLOSED'
        WHERE hubNo = :hubNo
    """)
    int deletePlace(@Param("hubNo") int hubNo);
}