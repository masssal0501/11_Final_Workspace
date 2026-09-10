package com.kh.workflow.attendance.model.service;

import com.kh.workflow.attendance.model.vo.Attendance;

public interface AttendanceService {

	/**
	 * 출근/퇴근 처리 (위치 인증 완료 후 호출)
	 *
	 * @param empNo        로그인한 사원 번호
	 * @param workcationNo 대상 워케이션 번호
	 * @param hubNo        체크한 거점 번호
	 * @param checkType    "IN"(출근) 또는 "OUT"(퇴근)
	 * @param latitude     체크 시점 위도
	 * @param longitude    체크 시점 경도
	 * @param distanceM    거점과의 거리(m)
	 * @return 저장된 근태 기록
	 */
	Attendance checkAttendance(int empNo, Integer workcationNo, Integer hubNo, String checkType, Double latitude,
			Double longitude, Integer distanceM);
}
