package com.kh.workflow.attendance.model.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.attendance.model.dao.AttendanceDao;
import com.kh.workflow.attendance.model.vo.Attendance;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Service
public class AttendanceServiceImpl implements AttendanceService {

	// 출근 인정 시각 - 이 시각을 넘겨 출근하면 지각으로 기록한다.
	private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 10);

	@Autowired
	private AttendanceDao attendanceDao;

	@Autowired
	private WorkcationDao workcationDao;

	@Override
	@Transactional
	public Attendance checkAttendance(int empNo, Integer workcationNo, Integer hubNo, String checkType,
			Double latitude, Double longitude, Integer distanceM) {

		if (!"IN".equals(checkType) && !"OUT".equals(checkType)) {
			throw new IllegalArgumentException("checkType은 IN 또는 OUT 이어야 합니다.");
		}

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		if (workcation.getEmployee() == null || workcation.getEmployee().getEmpNo() == null
				|| workcation.getEmployee().getEmpNo() != empNo) {
			throw new IllegalArgumentException("본인의 워케이션에 대해서만 출퇴근 처리할 수 있습니다.");
		}

		if (!"A".equals(workcation.getApproverState())) {
			throw new IllegalArgumentException("승인된 워케이션만 출퇴근 처리할 수 있습니다.");
		}

		// 현재 상태와 요청한 checkType이 어긋나지 않는지 검증(중복 출근/퇴근 방지)
		Optional<Attendance> latest = attendanceDao
				.findTopByWorkcation_WorkcationNoOrderByCheckedAtDesc(workcationNo);
		boolean alreadyCheckedIn = latest.isPresent() && "IN".equals(latest.get().getCheckType());

		if ("IN".equals(checkType) && alreadyCheckedIn) {
			throw new IllegalArgumentException("이미 출근 처리되었습니다.");
		}
		if ("OUT".equals(checkType) && !alreadyCheckedIn) {
			throw new IllegalArgumentException("출근 기록이 없어 퇴근 처리할 수 없습니다.");
		}

		Employee employee = new Employee();
		employee.setEmpNo(empNo);

		Hub hub = new Hub();
		hub.setHubNo(hubNo);

		Attendance attendance = new Attendance();
		attendance.setWorkcation(workcation);
		attendance.setEmployee(employee);
		attendance.setHub(hub);
		attendance.setCheckType(checkType);
		// DB DEFAULT CURRENT_TIMESTAMP에 맡기면 응답으로 반환하는 자바 객체에는
		// 값이 재조회되지 않아 null로 보이므로 직접 설정한다.
		attendance.setCheckedAt(LocalDateTime.now());
		attendance.setLatitude(latitude);
		attendance.setLongitude(longitude);
		attendance.setDistanceM(distanceM);

		if ("IN".equals(checkType)) {
			boolean isLate = LocalDateTime.now().toLocalTime().isAfter(LATE_THRESHOLD);
			attendance.setIsLate(isLate ? "Y" : "N");
		} else {
			attendance.setIsLate("N");
		}

		return attendanceDao.save(attendance);
	}
}
