package com.kh.workflow.task.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.task.model.vo.Task;

public interface TaskDao extends JpaRepository<Task, Integer> {

	// 부서 대시보드
	// 부서 평균 업무 진행률
	@Query("""
			SELECT COALESCE((SUM(CASE WHEN t.status = 'Y' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(t), 0)) * 100, 0.0)
			  FROM Task t
			  JOIN t.work w
			  JOIN w.workcationInfo wi
			  JOIN wi.employee e
			 WHERE e.depId = :depId
			   AND wi.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= wi.startAt
			   AND wi.endAt >= CURRENT_TIMESTAMP
			""")
	double AvgProgressRate(@Param("depId") String depId);

	// 사원 대시보드
	// 업무 진행률
	@Query("""
			SELECT COALESCE((SUM(CASE WHEN t.status = 'Y' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(t), 0)) * 100, 0.0)
			  FROM Task t
			  JOIN t.work w
			  JOIN w.workcationInfo wi
			  JOIN wi.employee e
			 WHERE e.empNo = :empNo
			   AND wi.approverState = 'A'
			   AND CURRENT_TIMESTAMP >= wi.startAt
			   AND wi.endAt >= CURRENT_TIMESTAMP
			""")
	double selectProgressRate(@Param("empNo") int empNo);

}
