package com.kh.workflow.attendance.model.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.attendance.model.vo.Attendance;

public interface AttendanceDao extends JpaRepository<Attendance, Integer> {

	// 현재 출근/퇴근 상태 판단(가장 최근 기록이 IN이면 출근중, OUT이면 퇴근 상태)에 사용
	Optional<Attendance> findTopByWorkcation_WorkcationNoOrderByCheckedAtDesc(Integer workcationNo);

	// 근무 기록 조회(TSK-014)용 전체 이력
	List<Attendance> findByWorkcation_WorkcationNoOrderByCheckedAtDesc(Integer workcationNo);
}
