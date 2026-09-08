package com.kh.workflow.workcation.model.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;
import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.Work;

@Repository
public interface WorkcationDao extends JpaRepository<WorkcationInfo, Integer> {
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
	
	 @Query(
		        value = """
		            SELECT DISTINCT w
		            FROM WorkcationInfo w
		            JOIN Reservation r
		                ON r.workcationNo = w.workcationNo
		            JOIN Hub h
		                ON r.hubNo = h.hubNo
		            WHERE (h.hubType = 1 OR h.hubType = 2)
		              AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion)
		              AND (:subRegion IS NULL OR h.subRegion = :subRegion)
		            ORDER BY w.workcationNo DESC
		        """,
		        countQuery = """
		            SELECT COUNT(DISTINCT w)
		            FROM WorkcationInfo w
		            JOIN Reservation r
		                ON r.workcationNo = w.workcationNo
		            JOIN Hub h
		                ON r.hubNo = h.hubNo
		            WHERE (h.hubType = 1 OR h.hubType = 2)
		              AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion)
		              AND (:subRegion IS NULL OR h.subRegion = :subRegion)
		        """
		    )
		    Page<WorkcationInfo> searchWorkcationList(
		        @Param("mainRegion") String mainRegion,
		        @Param("subRegion") String subRegion,
		        Pageable pageable
		    );

	Page<WorkcationInfo> findByEmployeeEmpNo(int empNo, Pageable pageable);

	@Query(value = """
			    SELECT DISTINCT w
			    FROM WorkcationInfo w
			    JOIN Reservation r
			        ON r.workcationNo = w.workcationNo
			    JOIN Hub h
			        ON r.hubNo = h.hubNo
			    WHERE w.employee.empNo = :empNo
			      AND (h.hubType = 1 OR h.hubType = 2)
			      AND (:mainRegion IS NULL OR h.mainRegion = :mainRegion)
			      AND (:subRegion IS NULL OR h.subRegion = :subRegion)
			    ORDER BY w.workcationNo DESC
			""", countQuery = """
			    SELECT COUNT(DISTINCT w)
			    FROM WorkcationInfo w
			    JOIN Reservation r
			        ON r.workcationNo = w.workcationNo
			    JOIN Hub h
			        ON r.hubNo = h.hubNo
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
		    JOIN Work wk ON wk.workcation = w
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
