package com.kh.workflow.workcation.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.kh.workflow.dashboard.model.dto.WaitingListDto;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w
			""")
	int countTotalApply();
	
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w WHERE w.approverState = 'W'
			""")
	int countWaiting();
	
	@Query("""
			SELECT COUNT(w) FROM WorkcationInfo w WHERE w.approverState = 'A'
			AND w.startAt <= CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP <= w.endAt
			""")
	int countInProgress();
	
	@Query("""
			SELECT COUNT(DISTINCT w.employee)
			FROM WorkcationInfo w
			WHERE w.approverState = 'A'
			""")
	int countTotalParticipants();

	@Query("""
		    SELECT new com.kh.workflow.dashboard.model.dto.WaitingListDto(e.empName, d.depTitle, h.mainRegion, w.startAt, w.endAt, w.approverState) 
		    FROM WorkcationInfo w 
		    JOIN w.employee e, 
		    Department d, 
		    Reservation r 
		    JOIN r.hub h 
		    WHERE e.depId = d.depId 
		      AND w = r.workcation 
		      AND w.approverState = 'W' 
		    ORDER BY w.workcationNo DESC
		    """)
	List<WaitingListDto> selectWaitingList();
	
	
}