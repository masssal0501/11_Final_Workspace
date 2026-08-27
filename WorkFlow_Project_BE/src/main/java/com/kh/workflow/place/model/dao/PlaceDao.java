package com.kh.workflow.place.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.place.model.vo.Hub;

public interface PlaceDao extends JpaRepository<Hub, Integer> {

    // 장소 목록 조회
    @Query("""
        SELECT h
        FROM Hub h
        WHERE (:type IS NULL OR h.hubType = :type)
          AND (:region IS NULL OR h.mainRegion = :region)
          AND (:subRegion IS NULL OR h.subRegion = :subRegion)
        ORDER BY h.hubNo DESC
    """)
    List<Hub> selectFilteredPlaceList(
        @Param("type") Integer type,
        @Param("region") String region,
        @Param("subRegion") String subRegion
    );

    // 특정 장소 조회
    Hub findByHubNoAndHubStatus(int hubNo, String hubStatus);

    // 장소 종료 처리
    @Modifying
    @Query("""
        UPDATE Hub
        SET hubStatus = 'CLOSED'
        WHERE hubNo = :hubNo
    """)
    int deletePlace(@Param("hubNo") int hubNo);

}