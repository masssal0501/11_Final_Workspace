package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.WorkFile;

public interface TaskDao extends JpaRepository<Task, Integer> {

	// 특정 근무(Work)에 속한 업무 목록 조회 (워케이션 상세화면의 업무계획/진행률 표시용)
	List<Task> findByWork_WorkNo(Integer workNo);

	/**
	 * [부서장] 특정 부서의 현재 진행 중인 워케이션 업무 평균 진행률(%) 조회
	 * 승인('A') 상태이며 현재 날짜 기준 진행 중인 워케이션에 소속된 업무들을 대상으로, 
	 * 완료('Y')된 업무의 비율을 계산하여 백분율로 반환합니다.
	 * 
	 * @param depId 부서 아이디
	 * @return double 부서 평균 업무 진행률 백분율 (대상 업무가 없으면 0.0 반환)
	 */
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

	/**
	 * [사원] 특정 사원의 현재 진행 중인 워케이션 업무 진행률(%) 조회
	 * 승인('A') 상태이며 현재 날짜 기준 진행 중인 워케이션에 소속된 본인의 업무들을 대상으로, 
	 * 완료('Y')된 업무의 비율을 계산하여 백분율로 반환합니다.
	 * 
	 * @param empNo 사원 번호
	 * @return double 개인 업무 진행률 백분율 (대상 업무가 없으면 0.0 반환)
	 */
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

	List<Task> findByWorkWorkNo(Integer workNo);

	Page<Task> findAllByOrderByTaskNoDesc(Pageable pageable);

	Page<Task> findByTaskTitleContainingOrderByTaskNoDesc(String keyword, Pageable pageable);

}