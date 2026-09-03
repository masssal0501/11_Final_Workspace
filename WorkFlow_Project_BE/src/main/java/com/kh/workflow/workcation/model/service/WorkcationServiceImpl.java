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
import com.kh.workflow.amount.dao.AmountItemDao;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountItem;
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

	@Autowired
	private AmountItemDao amountItemDao;

	@Override
	public Page<Map<String, Object>> selectWorkcationList(Map<String, Object> paramMap, Pageable pageable) {
		
		// 1. 오라클 DB용 빈문자열 NULL 변환
		String mainRegion = paramMap != null ? (String) paramMap.get("mainRegion") : null;
		String subRegion = paramMap != null ? (String) paramMap.get("subRegion") : null;

		if (mainRegion != null && mainRegion.trim().isEmpty()) {
			mainRegion = null;
		}
		if (subRegion != null && subRegion.trim().isEmpty()) {
			subRegion = null;
		}
		
		// 2. 검색 조건 적용된 JPQL 쿼리 호출 (findAll 대신 적용)
		Page<WorkcationInfo> page = workcationDao.searchWorkcationList(mainRegion, subRegion, pageable);
		
		return page.map(workcation -> {
			Map<String, Object> map = new HashMap<>();
			map.put("workcationNo", workcation.getWorkcationNo());
			map.put("workcationTitle", workcation.getWorkcationTitle());
			map.put("createdAt", workcation.getCreatedAt());
			map.put("approverState", workcation.getApproverState());
			map.put("employee", workcation.getEmployee());

			// 3. 람다식 내부 변수명 중복 해결 (hubMainRegion, hubSubRegion으로 변경)
			List<Reservation> reservations = reservationDao.findByWorkcation(workcation);
			String hubMainRegion = "";
			String hubSubRegion = "";

			if (reservations != null && !reservations.isEmpty()) {
				for (Reservation r : reservations) {
					if (r.getHub() != null) {
						int hubType = r.getHub().getHubType();
						if (hubType == 1 || hubType == 2) { // 오피스 또는 숙소
							hubMainRegion = r.getHub().getMainRegion() != null ? r.getHub().getMainRegion() : "";
							hubSubRegion = r.getHub().getSubRegion() != null ? r.getHub().getSubRegion() : "";
							break;
						}
					}
				}
			}

			map.put("mainRegion", hubMainRegion);
			map.put("subRegion", hubSubRegion);

			return map;
		});
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

		String workcationTitle = (String) paramMap.get("workcationTitle");
		if (workcationTitle == null || workcationTitle.trim().isEmpty()) {
			workcationTitle = "워케이션 신청";
		}

		// 편의성을 통한 제목 자동 생성
		String mainRegion = (String) paramMap.get("mainRegion");
		String subRegion = (String) paramMap.get("subRegion");

		String purpose = (String) paramMap.get("purpose");

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> planList = (List<Map<String, Object>>) paramMap.get("planList");
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
		info.setWorkPlan(planBuilder.toString());
		info.setStartAt(startAt);
		info.setEndAt(endAt);
		info.setEmployee(employee); // Employee 연관 객체 세팅

		info.setApproverState("W");// JPA가 인서트할때 W지정 등록

		WorkcationInfo workcation = workcationDao.save(info);

		// Hub 객체 생성
		Hub hub = new Hub();
		if (hubNo != null) {
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

		if (amount.getAmountNo() != null) {
			amountItemDao.deleteByAmount_AmountNo(amount.getAmountNo());

			Integer transportText = paramMap.get("transportText") != null
					? Integer.parseInt(paramMap.get("transportText").toString())
					: 0;
			if (transportText > 0) {
				AmountItem transportItem = new AmountItem();
				transportItem.setAmount(amount);
				transportItem.setItemType("교통");
				transportItem.setItemAmount(transportText);
				transportItem.setItemDate(LocalDateTime.now());
				amountItemDao.save(transportItem);
			}

			Integer etcText = paramMap.get("etcText") != null ? Integer.parseInt(paramMap.get("etcText").toString())
					: 0;
			if (etcText > 0) {
				AmountItem etcItem = new AmountItem();
				etcItem.setAmount(amount);
				etcItem.setItemType("기타");
				etcItem.setItemAmount(etcText);
				etcItem.setItemDate(LocalDateTime.now());
				amountItemDao.save(etcItem);
			}
		}
	}

	@Override
	public void insertWorkcation(WorkcationInfo workcartion) {
		workcationDao.save(workcartion);

	}

	@Override
	public Map<String, Object> getWorkcationDetail(Integer workcationNo) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		// 1. 해당 워케이션의 모든 예약(메인 거점 + 옵션 거점들) 조회
		List<Reservation> reservationList = reservationDao.findByWorkcation(workcation);

		Hub mainHub = null;
		Reservation mainReservation = null;
		List<Map<String, Object>> optionList = new ArrayList<>();

		if (reservationList != null) {
			for (Reservation reservation : reservationList) {
				Hub hub = reservation.getHub();
				if (hub != null) {
					int hubType = hub.getHubType(); // 1: 오피스, 2: 숙소, 3: 체험, 4: 맛집, 5: 관광지
					if (hubType == 1 || hubType == 2) {
						mainHub = hub;
						mainReservation = reservation;
					} else {
						// 옵션 거점 데이터 추출
						Map<String, Object> optMap = new HashMap<>();
						String typeStr = (hubType == 3) ? "program" : (hubType == 4) ? "restaurant" : "tour";
						optMap.put("type", typeStr);
						optMap.put("hubNo", hub.getHubNo());
						optMap.put("hubName", hub.getHubName());
						optMap.put("price", hub.getPrice());
						optMap.put("visitDate",
								reservation.getRsvStart() != null ? reservation.getRsvStart().toLocalDate().toString()
										: "");
						optionList.add(optMap);
					}
				}
			}
		}

		List<Amount> amountList = amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		Amount amount = (amountList != null && !amountList.isEmpty()) ? amountList.get(0) : null;

		// 2. amount_item에서 교통비, 기타 비용 조회
		List<AmountItem> itemList = amountItemDao.findByAmount_AmountNo(amount != null ? amount.getAmountNo() : null);
		int transportText = 0;
		int etcText = 0;

		if (itemList != null) {
			for (AmountItem item : itemList) {
				if ("교통".equals(item.getItemType())) {
					transportText = item.getItemAmount();
				} else if ("기타".equals(item.getItemType())) {
					etcText = item.getItemAmount();
				}
			}
		}

		Map<String, Object> result = new HashMap<>();
		result.put("workcationNo", workcation.getWorkcationNo());
		result.put("workcationTitle", workcation.getWorkcationTitle());
		result.put("startDate",
				workcation.getStartAt() != null ? workcation.getStartAt().toLocalDate().toString() : "");
		result.put("endDate", workcation.getEndAt() != null ? workcation.getEndAt().toLocalDate().toString() : "");
		result.put("peopleCount", mainReservation != null ? mainReservation.getUserCapacity() : 1);
		result.put("transportText", transportText);
		result.put("etcText", etcText);

		// 메인 지역 및 거점 정보
		result.put("mainRegion", mainHub != null ? mainHub.getMainRegion() : "");
		result.put("subRegion", mainHub != null ? mainHub.getSubRegion() : "");
		result.put("placeType", mainHub != null && mainHub.getHubType() == 2 ? "accommodation" : "office");
		result.put("hubNo", mainHub != null ? mainHub.getHubNo() : "");
		result.put("hubName", mainHub != null ? mainHub.getHubName() : "");
		result.put("hubAddress", mainHub != null ? mainHub.getHubAddress() : "");
		result.put("hubPrice", mainHub != null ? mainHub.getPrice() : 0);

		int totalSupport = amount != null && amount.getApprovedAmount() != null ? amount.getApprovedAmount() : 0;
		result.put("companySupport", totalSupport);
		result.put("localGovSupport", 0);
		result.put("totalSupport", totalSupport);

		// 옵션 가격 합산 계산
		int optionsTotalPrice = 0;
		for (Map<String, Object> opt : optionList) {
			optionsTotalPrice += (int) opt.get("price");
		}
		int mainPrice = (mainHub != null) ? mainHub.getPrice() : 0;
		int totalCost = mainPrice + optionsTotalPrice + transportText + etcText;

		result.put("totalCost", totalCost);
		result.put("personalCost", Math.max(0, totalCost - totalSupport));

		// workPlan 파싱
		List<Map<String, Object>> planList = new ArrayList<>();
		String workPlan = workcation.getWorkPlan();
		String actualPurpose = "";

		if (workPlan != null && !workPlan.isEmpty()) {
			String[] tokens = workPlan.split(" / ");
			for (String token : tokens) {
				token = token.trim();
				if (token.startsWith("[근무 목적]")) {
					actualPurpose = token.replace("[근무 목적]", "").trim();
				} else {
					int idxOpen = token.lastIndexOf("(");
					int idxClose = token.lastIndexOf("일)");
					if (idxOpen != -1 && idxClose != -1 && idxClose > idxOpen) {
						String taskName = token.substring(0, idxOpen).trim();
						try {
							int days = Integer.parseInt(token.substring(idxOpen + 1, idxClose).trim());
							Map<String, Object> planMap = new HashMap<>();
							planMap.put("id", System.currentTimeMillis() + Math.random());
							planMap.put("taskName", taskName);
							planMap.put("days", days);
							planList.add(planMap);
						} catch (NumberFormatException e) {
							Map<String, Object> planMap = new HashMap<>();
							planMap.put("id", System.currentTimeMillis() + Math.random());
							planMap.put("taskName", token);
							planMap.put("days", 1);
							planList.add(planMap);
						}
					} else if (!token.isEmpty()) {
						Map<String, Object> planMap = new HashMap<>();
						planMap.put("id", System.currentTimeMillis() + Math.random());
						planMap.put("taskName", token);
						planMap.put("days", 1);
						planList.add(planMap);
					}
				}
			}
		}

		result.put("purpose", actualPurpose);
		result.put("planList", planList);

		// 조회된 옵션 예약 목록을 전달 (기존 new ArrayList<>() 대체)
		result.put("option", optionList);
		result.put("options", optionList);

		return result;
	}

	@Override
	@Transactional
	public void updateWorkcation(Integer workcationNo, Map<String, Object> updateData) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		// 1. 제목 및 업무 계획 조합
		String workcationTitle = (String) updateData.get("workcationTitle");
		if (workcationTitle == null || workcationTitle.trim().isEmpty()) {
			workcationTitle = "워케이션 신청";
		}

		String purpose = (String) updateData.get("purpose");

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> planList = (List<Map<String, Object>>) updateData.get("planList");
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

		// 날짜 변환
		LocalDateTime startAt = LocalDate.parse((String) updateData.get("startDate")).atStartOfDay();
		LocalDateTime endAt = LocalDate.parse((String) updateData.get("endDate")).atStartOfDay();

		// 워케이션 기본 정보 수정 저장
		workcation.setWorkcationTitle(workcationTitle);
		workcation.setWorkPlan(planBuilder.toString());
		workcation.setStartAt(startAt);
		workcation.setEndAt(endAt);
		workcationDao.save(workcation);

		// 2. 예약(Reservation) 정보 수정 (기존 예약 삭제 후 메인+옵션 재등록)
		List<Reservation> existingRsvs = reservationDao.findByWorkcation(workcation);
		if (existingRsvs != null && !existingRsvs.isEmpty()) {
			reservationDao.deleteAll(existingRsvs);
		}

		Object peopleCountObj = updateData.get("peopleCount");
		Integer peopleCount = peopleCountObj != null ? Integer.parseInt(peopleCountObj.toString()) : 1;

		// 2-1. 메인 거점(오피스/숙소) 예약 등록
		Object hubNoObj = updateData.get("hubNo");
		if (hubNoObj != null) {
			Reservation mainRsv = new Reservation();
			mainRsv.setWorkcation(workcation);
			Hub mainHub = new Hub();
			mainHub.setHubNo(Integer.parseInt(hubNoObj.toString()));
			mainRsv.setHub(mainHub);
			mainRsv.setUserCapacity(peopleCount);
			mainRsv.setRsvStart(startAt);
			mainRsv.setRsvEnd(endAt);
			reservationDao.save(mainRsv);
		}

		// 2-2. 옵션 거점(체험, 맛집, 관광지) 예약 등록
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> options = (List<Map<String, Object>>) updateData.get("options");
		if (options != null) {
			for (Map<String, Object> optionMap : options) {
				Object optionHubNoObj = optionMap.get("hubNo");
				Object visitDateObj = optionMap.get("visitDate");

				if (optionHubNoObj != null) {
					Integer optionHubNo = Integer.parseInt(optionHubNoObj.toString());
					LocalDateTime visitDate = (visitDateObj != null && !visitDateObj.toString().isEmpty())
							? LocalDate.parse(visitDateObj.toString()).atStartOfDay()
							: startAt;

					Reservation optionRsv = new Reservation();
					optionRsv.setWorkcation(workcation);
					Hub optionHub = new Hub();
					optionHub.setHubNo(optionHubNo);
					optionRsv.setHub(optionHub);
					optionRsv.setUserCapacity(peopleCount);
					optionRsv.setRsvStart(visitDate);
					optionRsv.setRsvEnd(visitDate);
					reservationDao.save(optionRsv);
				}
			}
		}

		// 3. 지원금(Amount) 정보 수정
		List<Amount> amountList = amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		Amount amount = (amountList != null && !amountList.isEmpty()) ? amountList.get(0) : new Amount();

		amount.setWorkcationNo(workcation.getWorkcationNo());

		Integer approvedAmount = 0;
		if (updateData.get("totalSupport") != null) {
			approvedAmount = Integer.parseInt(updateData.get("totalSupport").toString());
		}
		amount.setApprovedAmount(approvedAmount);
		amount.setStatus("W");
		amountDao.save(amount);

		// 4. 비용 상세 항목(AmountItem: 교통, 기타만 관리) 수정
		if (amount.getAmountNo() != null) {
			amountItemDao.deleteByAmount_AmountNo(amount.getAmountNo());

			Integer transportText = updateData.get("transportText") != null
					? Integer.parseInt(updateData.get("transportText").toString())
					: 0;
			if (transportText > 0) {
				AmountItem transportItem = new AmountItem();
				transportItem.setAmount(amount);
				transportItem.setItemType("교통");
				transportItem.setItemAmount(transportText);
				transportItem.setItemDate(LocalDateTime.now());
				amountItemDao.save(transportItem);
			}

			Integer etcText = updateData.get("etcText") != null ? Integer.parseInt(updateData.get("etcText").toString())
					: 0;
			if (etcText > 0) {
				AmountItem etcItem = new AmountItem();
				etcItem.setAmount(amount);
				etcItem.setItemType("기타");
				etcItem.setItemAmount(etcText);
				etcItem.setItemDate(LocalDateTime.now());
				amountItemDao.save(etcItem);
			}
		}
	}

	@Override
	@Transactional
	public void deleteWorkcation(Integer workcationNo) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		List<Reservation> reservationList = reservationDao.findByWorkcation(workcation);
		if (reservationList != null) {
			reservationDao.deleteAll(reservationList);
		}

		List<Amount> amountList = amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		if (amountList != null && !amountList.isEmpty()) {
			amountDao.deleteAll(amountList);
		}

		workcationDao.delete(workcation);
	}

}
