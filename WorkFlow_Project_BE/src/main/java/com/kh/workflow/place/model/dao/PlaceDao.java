package com.kh.workflow.place.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.place.model.vo.Place;

public interface PlaceDao extends JpaRepository<Place, Integer> {

    // 운영 중인 장소 조회
    List<Place> findByHubStatusOrderByHubNoDesc(String hubStatus);

    // 특정 장소 조회
    Place findByHubNoAndHubStatus(int hubNo, String hubStatus);

    // 장소 종료 처리
    @Modifying
    @Query("""
        UPDATE Place
        SET hubStatus = 'CLOSED'
        WHERE hubNo = :hubNo
    """)
    int deletePlace(@Param("hubNo") int hubNo);

}