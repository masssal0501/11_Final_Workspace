package com.kh.workflow.workcation.model.dao;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Repository
public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {

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


