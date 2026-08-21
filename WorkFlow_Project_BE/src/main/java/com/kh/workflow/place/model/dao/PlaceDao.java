package com.kh.workflow.place.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.place.model.vo.Place;

public interface PlaceDao extends JpaRepository<Place, Integer> {

	List<Place> findByStatusOrderByHubNoDesc(String status);

	Place findByHubNoAndStatus(int hubNo, String string);
	
    // 소프트 삭제
    @Modifying
    @Query("""
        UPDATE Place
        SET status = 'N'
        WHERE hubNo = :hubNo
    """)
    int deletePlace(@Param("hubNo") int hubNo);

}
