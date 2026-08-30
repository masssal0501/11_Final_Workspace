package com.kh.workflow.workcation.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Employee 엔티티 패키지 경로에 맞게 확인 필요
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.workcation.model.dao.ReservationDao;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Service
public class WorkcationServiceImpl implements WorkcationService {

	@Autowired
	private WorkcationDao workcationDao;

	@Autowired
	private ReservationDao reservationDao;

	@Override
	public Page<WorkcationInfo> selectWorkcationList(Pageable pageable) {
		// Spring Data JPA를 통한 페이징 조회
		return workcationDao.findAll(pageable);
	}

	@Override
	@Transactional
	public void insertWorkcationEnroll(Map<String, Object> paramMap) {

		// 편의성을 통한 제목 자동 생성
		String mainRegion = (String) paramMap.get("mainRegion");
		String subRegion = (String) paramMap.get("subRegion");
		String workcationTitle = "[" + mainRegion + " " + subRegion + "] 워케이션 신청";

		String plan = (String) paramMap.get("plan");

		// LocalDateTime 변환
		LocalDateTime startAt = LocalDate.parse((String) paramMap.get("startDate")).atStartOfDay();
		LocalDateTime endAt = LocalDate.parse((String) paramMap.get("endDate")).atStartOfDay();

		Integer empNo = Integer.parseInt(paramMap.get("empNo").toString());
		Integer hubNo = Integer.parseInt(paramMap.get("hubNo").toString());

		// JPA 단방향/양방향 연관관계 객체(Employee) 생성
		Employee employee = new Employee();
		employee.setEmpNo(empNo);

		// Workcation 객체 생성
		WorkcationInfo info = new WorkcationInfo();
		info.setWorkcationTitle(workcationTitle);
		info.setWorkPlan(plan);
		info.setStartAt(startAt);
		info.setEndAt(endAt);
		info.setEmployee(employee); // Employee 연관 객체 세팅

		WorkcationInfo workcation = workcationDao.save(info);

		// Hub 객체 생성
		Hub hub = new Hub();
		hub.setHubNo(hubNo);

		Reservation reservation = new Reservation();
		reservation.setWorkcation(workcation);
		reservation.setHub(hub);
		reservation.setUserCapacity(hubNo);

		reservationDao.save(reservation);
	}
}