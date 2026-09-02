package com.kh.workflow.workcation.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.model.vo.Amount;
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

	@Autowired
	private AmountDao amountDao;

	@Override
	public Page<WorkcationInfo> selectWorkcationList(Pageable pageable) {
		// Spring Data JPA를 통한 페이징 조회
		return workcationDao.findAll(pageable);
	}


	@Override
	public Map<String, Object> getAmountSupportInfo() {

		Map<String, Object> supportInfo = new HashMap<>();
		int companySupport = 0;
		Amount companyAmount = amountDao.findTopByOrderByAmountNoDesc();

		if (companyAmount != null && companyAmount.getApprovedAmount() != null) {
			companySupport = companyAmount.getApprovedAmount();
		} else {
			companySupport = 0;
		}

		supportInfo.put("companySupport", companySupport);
		return supportInfo;
	}
	
	@Override
	@Transactional
	public void insertWorkcationEnrollForm(Map<String, Object> paramMap) {
		
		String workcationTitle = (String)paramMap.get("workcationTitle");
		if(workcationTitle == null || workcationTitle.trim().isEmpty()) {
			String mainRegion = (String) paramMap.get("mainRegion");
			String subRegion = (String) paramMap.get("subRegion");
			workcationTitle = "[" + (mainRegion != null ? mainRegion : "" ) + " " + (subRegion != null ? subRegion : "") + "] \n 워케이션 신청";
		}
		
		// 편의성을 통한 제목 자동 생성
		String mainRegion = (String) paramMap.get("mainRegion");
		String subRegion = (String) paramMap.get("subRegion");		

		String purpose = (String) paramMap.get("purpose");
		
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> planList = (List<Map<String,Object>>) paramMap.get("planList");
		StringBuilder planBuilder = new StringBuilder();
		
		if (purpose != null && !purpose.isEmpty()) {
			planBuilder.append("[근무 목적] ").append(purpose);
		}
		
		if (planList != null) {
			for (Map<String, Object> planItem : planList) {
				String taskName = (String) planItem.get("taskName");
				Object days = planItem.get("days");
				if (planBuilder.length() > 0) {
					planBuilder.append(" / ");
				}
				planBuilder.append(taskName).append("(").append(days).append("일)");	
			}
		}
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
		info.setWorkcationTitle(workcationTitle);
		info.setWorkPlan(planBuilder.toString());
		info.setStartAt(startAt);
		info.setEndAt(endAt);
		info.setEmployee(employee); // Employee 연관 객체 세팅

		info.setApproverState("W");// JPA가 인서트할때 W지정 등록

		WorkcationInfo workcation = workcationDao.save(info);

		// Hub 객체 생성
		Hub hub = new Hub();
		if(hubNo != null) {
			hub.setHubNo(hubNo);
		}
		
		Object peopleCountObj = paramMap.get("peopleCount");
		Integer peopleCount = peopleCountObj != null ? Integer.parseInt(peopleCountObj.toString()) : 1;
		
		Reservation reservation = new Reservation();
		reservation.setWorkcation(workcation);
		reservation.setHub(hub);
		reservation.setUserCapacity(peopleCount);
		reservation.setRsvStart(startAt);
		reservation.setRsvEnd(endAt);

		reservationDao.save(reservation);

		// 프론트에서 넘어온 총 지원금(예상금액)
		Amount amount = new Amount();
		amount.setWorkcationNo(workcation.getWorkcationNo());

		Integer approvedAmount = 0;
		if (paramMap.get("totalSupport") != null) {
			approvedAmount = Integer.parseInt(paramMap.get("totalSupport").toString());
		}

		amount.setApprovedAmount(approvedAmount);

		amount.setRequestedAt(LocalDateTime.now());
		amount.setCreatedAt(LocalDateTime.now());
		amount.setStatus("W");
		amountDao.save(amount);
	}

	@Override
	public void insertWorkcation(WorkcationInfo workcartion) {
		workcationDao.save(workcartion);

	}


	@Override
	public Map<String, Object> getWorkcationDetail(Integer workcationNo) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> 
				new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		Reservation reservation = reservationDao.findByWorkcation(workcation);
		Hub hub = reservation != null ? reservation.getHub() : null;

		List<Amount> amountList = amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		Amount amount = (amountList != null && !amountList.isEmpty()) ? amountList.get(0) : null;

		Map<String, Object> result = new HashMap<>();
		result.put("workcationNo", workcation.getWorkcationNo());
		result.put("workcationTitle", workcation.getWorkcationTitle());
		result.put("purpose", workcation.getWorkPlan());
		result.put("startDate", workcation.getStartAt() != null 
								? workcation.getStartAt().toLocalDate().toString() : "");
		result.put("endDate", workcation.getEndAt() != null 
								? workcation.getEndAt().toLocalDate().toString() : ""); 																									// 변경
		result.put("peopleCount", reservation != null ? reservation.getUserCapacity() : 1); 	
		

		String title = workcation.getWorkcationTitle();
		String mainRegion = "";
		String subRegion = "";
		if (title != null && title.startsWith("[")) {
			int closeIdx = title.indexOf("]");
			if (closeIdx > 1) {
				String regionPart = title.substring(1, closeIdx);
				String[] split = regionPart.split(" ");
				if (split.length > 0)
					mainRegion = split[0];
				if (split.length > 1)
					subRegion = split[1];
			}
		}
		result.put("mainRegion", mainRegion);
		result.put("subRegion", subRegion);

		result.put("placeType", hub != null && hub.getHubType() == 2 ? "accommodation" : "office");
		result.put("hubName", hub != null ? hub.getHubName() : "");
		result.put("hubAddress", hub != null ? hub.getHubAddress() : "");
		result.put("hubPrice", hub != null ? hub.getPrice() : 0);

		int totalSupport = amount != null && amount.getApprovedAmount() != null ? amount.getApprovedAmount() : 0;
		result.put("companySupport", totalSupport);
		result.put("localGovSupport", 0);
		result.put("totalSupport", totalSupport);
		result.put("totalCost", hub != null ? hub.getPrice() : 0);
		result.put("personalCost", 0);

		List<Map<String, Object>> planList = new ArrayList<>();
		String workPlan = workcation.getWorkPlan();
		if (workPlan != null && !workPlan.isEmpty()) {
			Map<String, Object> planMap = new HashMap<>();
			planMap.put("taskName", workPlan);
			planMap.put("days", 1);
			planList.add(planMap);
		}

		result.put("planList", planList);
		result.put("option", new ArrayList<>());

		return result;
	}


	@Override
	@Transactional
	public void deleteWorkcation(Integer workcationNo) {		
		
		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(()-> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));
		
		Reservation reservation = reservationDao.findByWorkcation(workcation);
		if(reservation != null) {
			reservationDao.delete(reservation);
		}
		
		List<Amount> amountList =amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		if(amountList != null && !amountList.isEmpty()) {
			amountDao.deleteAll(amountList);
		}
		
		workcationDao.delete(workcation);
	}
}
