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
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.dao.AmountItemDao;
import com.kh.workflow.amount.dao.SupportListDao;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.task.model.dao.TaskHistoryDao;
import com.kh.workflow.task.model.dao.WorkDao;
import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.TaskHistory;
import com.kh.workflow.task.model.vo.Work;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.reservation.model.dao.ReservationDao;
import com.kh.workflow.reservation.model.vo.Reservation;
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

	@Autowired
	private SupportListDao supportListDao;

	@Autowired
	private com.kh.workflow.hub.model.dao.HubDao hubDao;

	@Autowired
	private TaskDao taskDao;

	@Autowired
	private TaskHistoryDao taskHistoryDao;

	@Autowired
	private WorkDao workDao;

	@Override
	public Page<Map<String, Object>> selectWorkcationList(Map<String, Object> paramMap, Pageable pageable) {

		int empNo = (int) paramMap.get("empNo");
		
		// 1. 오라클 DB용 빈문자열 NULL 변환
		String mainRegion = paramMap != null ? (String) paramMap.get("mainRegion") : null;
		String subRegion = paramMap != null ? (String) paramMap.get("subRegion") : null;

		Page<WorkcationInfo> workcationPage = workcationDao.findByEmployeeEmpNo(empNo, pageable);
		
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
			List<Reservation> reservations = reservationDao.findByWorkcationNo(
	                workcation.getWorkcationNo());
			String hubMainRegion = "";
			String hubSubRegion = "";

			if (reservations != null && !reservations.isEmpty()) {
				for (Reservation r : reservations) {

				    if (r.getHubNo() != null) {

				        Hub hub = hubDao.findById(r.getHubNo())
				                .orElse(null);

				        if (hub != null) {

				            int hubType = hub.getHubType();
				            if (hubType == 1 || hubType == 2) {
				            	
				            }
				                hubMainRegion =
				                        hub.getMainRegion() != null
				                                ? hub.getMainRegion()
				                                : "";

				                hubSubRegion =
				                        hub.getSubRegion() != null
				                                ? hub.getSubRegion()
				                                : "";

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

		Work work = new Work();
		work.setWorkcation(workcation);
		work.setSubmittedAt(LocalDateTime.now());

		Work saveWork = workDao.save(work);

		if (planList != null) {

			for (Map<String, Object> planItem : planList) {

				String taskName = (String) planItem.get("taskName");

				Task task = new Task();

				task.setTaskTitle(taskName);
				task.setTaskContent("");
				task.setTasktimeAt(LocalDateTime.now());
				task.setProgress(0);
				task.setStatus("N");
				task.setWork(saveWork);

				taskDao.save(task);
			}
		}

		// Hub 객체 생성
		Hub hub = new Hub();
		if (hubNo != null) {
			hub.setHubNo(hubNo);
		}

		Object peopleCountObj = paramMap.get("peopleCount");
		Integer peopleCount = peopleCountObj != null ? Integer.parseInt(peopleCountObj.toString()) : 1;

		Reservation reservation = new Reservation();

		reservation.setWorkcationNo(workcation.getWorkcationNo());
		reservation.setHubNo(hubNo);
		reservation.setUserCapacity(peopleCount);
		reservation.setRsvStart(startAt);
		reservation.setRsvEnd(endAt);
		reservation.setRsvStatus("N");

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
		List<Reservation> reservationList = reservationDao.findByWorkcationNo(
                workcation.getWorkcationNo());

		Hub mainHub = null;
		Reservation mainReservation = null;
		List<Map<String, Object>> optionList = new ArrayList<>();

		if (reservationList != null) {
			for (Reservation reservation : reservationList) {

			    Hub hub = null;

			    if (reservation.getHubNo() != null) {
			        hub = hubDao.findById(
			                reservation.getHubNo()
			        ).orElse(null);
			    }

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

		// 3. 지원금(Amount) 및 지자체 지원금(SupportList) 계산 (중복 선언 제거됨)
		int companySupport = 0;
		if (amount != null && amount.getApprovedAmount() != null) {
			companySupport = amount.getApprovedAmount();
		}

		int localGovSupport = 0;
		if (amount != null) {
			List<SupportList> supportList = supportListDao.findByAmount_AmountNo(amount.getAmountNo());
			if (supportList != null) {
				for (SupportList s : supportList) {
					if (s.getRequestAmount() != null) {
						localGovSupport += s.getRequestAmount();
					}
				}
			}
		}

		result.put("companySupport", companySupport);
		result.put("localGovSupport", localGovSupport);

		int totalSupport = companySupport + localGovSupport;
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
				planBuilder.append(taskName).append("(").append(days != null ? days : 1).append("일)");
			}
		}

		// 날짜 변환
		LocalDateTime startAt = parseDateSafely(updateData.get("startDate"), LocalDateTime.now());
		LocalDateTime endAt = parseDateSafely(updateData.get("endDate"), startAt);

		// 워케이션 기본 정보 수정 저장
		workcation.setWorkcationTitle(workcationTitle);
		workcation.setWorkPlan(planBuilder.toString());
		workcation.setStartAt(startAt);
		workcation.setEndAt(endAt);
		workcationDao.save(workcation);

		// 2. 예약(Reservation) 정보 수정 (기존 예약 삭제 후 메인+옵션 재등록)
		List<Reservation> existingRsvs = reservationDao.findByWorkcationNo(
                workcation.getWorkcationNo());
		if (existingRsvs != null && !existingRsvs.isEmpty()) {
			reservationDao.deleteAll(existingRsvs);
		}

		Object peopleCountObj = updateData.get("peopleCount");
		Integer peopleCount = 1;
		if (peopleCountObj != null && !peopleCountObj.toString().trim().isEmpty()) {
			peopleCount = Integer.parseInt(peopleCountObj.toString());
		}

		// 2-1. 메인 거점(오피스/숙소) 예약 등록
		Object hubNoObj = updateData.get("hubNo");
		String mainRegion = "";
		String subRegion = "";
		int mainHubPrice = 0;

		if (hubNoObj != null && !hubNoObj.toString().trim().isEmpty()) {
			Reservation mainRsv = new Reservation();

			if (hubNoObj != null && !hubNoObj.toString().trim().isEmpty()) {
				Integer mainHubNo = Integer.parseInt(hubNoObj.toString());

				mainRsv.setWorkcationNo(workcation.getWorkcationNo());
				Hub mainHub = new Hub();
				mainHub.setHubNo(mainHubNo);
				mainRsv.setHubNo(mainHubNo);
				mainRsv.setUserCapacity(peopleCount);
				mainRsv.setRsvStart(startAt);
				mainRsv.setRsvEnd(endAt);
				reservationDao.save(mainRsv);

				Hub foundHub = hubDao.findById(mainHubNo).orElse(null);
				if (foundHub != null) {
					mainRegion = foundHub.getMainRegion();
					subRegion = foundHub.getSubRegion();
					mainHubPrice = foundHub.getPrice();
				}
			}

			// 2-2. 옵션 거점(체험, 맛집, 관광지) 예약 등록
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> options = (List<Map<String, Object>>) updateData.get("options");
			if (options == null) {

				@SuppressWarnings("unchecked")
				List<Map<String, Object>> altOptions = (List<Map<String, Object>>) updateData.get("option");
				options = altOptions;
			}

			if (options != null) {
				for (Map<String, Object> optionMap : options) {
					Object optionHubNoObj = optionMap.get("hubNo");
					Object visitDateObj = optionMap.get("visitDate");

					// hubNo 및 visitDate 빈 문자열("") 체크
					if (optionHubNoObj != null && !optionHubNoObj.toString().trim().isEmpty()) {
						Integer optionHubNo = Integer.parseInt(optionHubNoObj.toString());
						LocalDateTime visitDate = parseDateSafely(visitDateObj, startAt);

						Reservation optionRsv = new Reservation();
						optionRsv.setHubNo(optionHubNo);
						optionRsv.setWorkcationNo(workcation.getWorkcationNo());						
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

			Object transportObj = updateData.get("transportText");
			Integer transportText = (transportObj != null && !transportObj.toString().trim().isEmpty())
					? Integer.parseInt(transportObj.toString())
					: 0;

			Object etcObj = updateData.get("etcText");
			Integer etcText = (etcObj != null && !etcObj.toString().trim().isEmpty())
					? Integer.parseInt(etcObj.toString())
					: 0;

			int totalCost = mainHubPrice + transportText + etcText;

			processAmountAndSupportList(workcation, amount, mainRegion, subRegion, totalCost);

			// 4. 비용 상세 항목(AmountItem: 교통, 기타) 수정
			if (amount.getAmountNo() != null) {
				amountItemDao.deleteByAmount_AmountNo(amount.getAmountNo());

				if (transportText > 0) {
					AmountItem transportItem = new AmountItem();
					transportItem.setAmount(amount);
					transportItem.setItemType("교통");
					transportItem.setItemAmount(transportText);
					transportItem.setItemDate(LocalDateTime.now());
					amountItemDao.save(transportItem);
				}

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
	}

	private void processAmountAndSupportList(WorkcationInfo workcation, Amount amount, String mainRegion,
			String subRegion, int totalCost) {
		int totalLocalGovSupport = 0;
		List<SupportList> supportItems = new ArrayList<>();

		if ("강원도".equals(mainRegion) || "강원특별자치도".equals(mainRegion)) {
			SupportList province = new SupportList();
			province.setSponsorName("강원도청");
			province.setRequestAmount(100000); // 예상 지원금
			province.setApprovedAmount(0);
			province.setTransportSupported("Y");
			province.setOtherSupported("N");
			province.setStatus("W");
			supportItems.add(province);
			totalLocalGovSupport += 100000;

			if ("강릉시".equals(subRegion)) {
				SupportList city = new SupportList();
				city.setSponsorName("강릉시청");
				city.setRequestAmount(50000); // 예상 지원금
				city.setApprovedAmount(0);
				city.setTransportSupported("N");
				city.setOtherSupported("Y");
				city.setStatus("W");
				supportItems.add(city);
				totalLocalGovSupport += 50000;
			}
		} else if ("부산광역시".equals(mainRegion)) {
			SupportList city = new SupportList();
			city.setSponsorName("부산광역시청");
			city.setRequestAmount(200000);
			city.setApprovedAmount(0);
			city.setTransportSupported("Y");
			city.setOtherSupported("Y");
			city.setStatus("W");
			supportItems.add(city);
			totalLocalGovSupport += 200000;
		}

		int companyLimit = 100000; // 사내 지원 한도
		int remainCost = Math.max(0, totalCost - totalLocalGovSupport);
		int expectedCompanySupport = Math.min(remainCost, companyLimit);

		amount.setWorkcationNo(workcation.getWorkcationNo());
		amount.setApprovedAmount(expectedCompanySupport); // 예상 회사지원금 저장
		amount.setStatus("W");
		if (amount.getCreatedAt() == null) {
			amount.setCreatedAt(LocalDateTime.now());
		}
		if (amount.getRequestedAt() == null) {
			amount.setRequestedAt(LocalDateTime.now());
		}

		amountDao.save(amount);

		if (amount.getAmountNo() != null) {
			supportListDao.deleteByAmount_AmountNo(amount.getAmountNo());
		}

		for (SupportList item : supportItems) {
			item.setAmount(amount);
			supportListDao.save(item);
		}
	}

	private LocalDateTime parseDateSafely(Object dateObj, LocalDateTime fallback) {
		if (dateObj == null)
			return fallback;
		String str = dateObj.toString().trim();
		if (str.isEmpty())
			return fallback;

		// "2026. 09. 04." 또는 "2026.09.04" -> "2026-09-04" 변환
		str = str.replace(". ", "-").replace(".", "-").trim();
		if (str.endsWith("-")) {
			str = str.substring(0, str.length() - 1);
		}
		if (str.contains("T")) {
			str = str.split("T")[0];
		}
		try {
			return LocalDate.parse(str).atStartOfDay();
		} catch (Exception e) {
			return fallback;
		}
	}

	@Override
	@Transactional
	public void deleteWorkcation(Integer workcationNo) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		List<Reservation> reservationList = reservationDao.findByWorkcationNo(
                workcation.getWorkcationNo());
		if (reservationList != null) {
			reservationDao.deleteAll(reservationList);
		}

		List<Amount> amountList = amountDao.findByWorkcationNo(workcation.getWorkcationNo());
		if (amountList != null && !amountList.isEmpty()) {
			amountDao.deleteAll(amountList);
		}

		workcationDao.delete(workcation);
	}

	@Override
	public Page<Map<String, Object>> selectMyWorkcationList(Map<String, Object> paramMap, Pageable pageable) {

		int empNo = (int) paramMap.get("empNo");

		String mainRegion = paramMap.get("mainRegion") != null ? (String) paramMap.get("mainRegion") : null;

		String subRegion = paramMap.get("subRegion") != null ? (String) paramMap.get("subRegion") : null;

		// 빈 문자열이면 JPA 검색조건에서 제외하기 위해 null 처리
		if (mainRegion != null && mainRegion.trim().isEmpty()) {
			mainRegion = null;
		}

		if (subRegion != null && subRegion.trim().isEmpty()) {
			subRegion = null;
		}

		Page<WorkcationInfo> page = workcationDao.searchMyWorkcationList(empNo, mainRegion, subRegion, pageable);

		return page.map(workcation -> {

			Map<String, Object> map = new HashMap<>();

			map.put("workcationNo", workcation.getWorkcationNo());

			map.put("workcationTitle", workcation.getWorkcationTitle());

			map.put("createdAt", workcation.getCreatedAt());

			map.put("approverState", workcation.getApproverState());

			// 지역 조회
			List<Reservation> reservations =
			        reservationDao.findByWorkcationNo(workcation.getWorkcationNo());

			String main = "";
			String sub = "";

			if (reservations != null && !reservations.isEmpty()) {

			    for (Reservation reservation : reservations) {

			        if (reservation.getHubNo() == null) {
			            continue;
			        }

			        Hub hub = hubDao.findById(reservation.getHubNo())
			                .orElse(null);

			        if (hub == null) {
			            continue;
			        }

			        int hubType = hub.getHubType();

			        // 메인 거점 또는 숙소
			        if (hubType == 1 || hubType == 2) {

			            main = hub.getMainRegion() != null
			                    ? hub.getMainRegion()
			                    : "";

			            sub = hub.getSubRegion() != null
			                    ? hub.getSubRegion()
			                    : "";

			            break;
			        }
			    }
			}

			map.put("mainRegion", main);
			map.put("subRegion", sub);

			return map;
		});
	}

	@Override
	public Map<String, Object> getMyWorkcationDetail(Integer workcationNo, int empNo) {

		WorkcationInfo workcation = workcationDao.findByWorkcationNoAndEmployeeEmpNo(workcationNo, empNo)
				.orElseThrow(() -> new RuntimeException("조회할 수 없는 워케이션입니다."));

		Map<String, Object> result = getWorkcationDetail(workcationNo);

		List<Work> workList = workDao.findByWorkcationWorkcationNo(workcationNo);

		List<Map<String, Object>> taskList = new ArrayList<>();

		List<Map<String, Object>> historyList = new ArrayList<>();

		for (Work work : workList) {

			List<Task> tasks = taskDao.findByWorkWorkNo(work.getWorkNo());

			for (Task task : tasks) {

				Map<String, Object> taskMap = new HashMap<>();

				taskMap.put("taskNo", task.getTaskNo());
				taskMap.put("taskName", task.getTaskTitle());
				taskMap.put("taskTitle", task.getTaskTitle());
				taskMap.put("taskContent", task.getTaskContent());
				taskMap.put("progress", task.getProgress() != null ? task.getProgress() : 0);
				taskMap.put("status", task.getStatus());
				taskList.add(taskMap);

				List<TaskHistory> histories = taskHistoryDao.findByTaskTaskNoOrderByCreatedAtDesc(task.getTaskNo());

				for (TaskHistory history : histories) {

					Map<String, Object> historyMap = new HashMap<>();

					historyMap.put("history", history.getHistoryNo());
					historyMap.put("taskNo", task.getTaskNo());
					historyMap.put("title", history.getHistoryTitle());
					historyMap.put("content", history.getHistoryContent());
					historyMap.put("progress", history.getProgress());
					historyMap.put("createdAt", history.getCreatedAt());
					historyList.add(historyMap);

				}
			}
		}
		result.put("planList", taskList);
		result.put("historyList", historyList);

		return result;
	}

	@Transactional
	@Override
	public void updateTask(Integer taskNo, Integer progress, String title, String content, MultipartFile file) {

		Task task = taskDao.findById(taskNo).orElseThrow(() -> new RuntimeException("업무를 찾을수 없습니다."));

		// 진행률 검증
		if (progress < 0 || progress > 100 || progress % 5 != 0) {
			throw new IllegalArgumentException("진행률은 0~100 사이의 5단위 값");
		}

		// task 업데이트 최신 상태
		task.setProgress(progress);
		task.setTaskTitle(title);
		task.setTaskContent(content);

		// 최근 업무 이력 INSERT
		TaskHistory history = new TaskHistory();

		history.setTask(task);
		history.setHistoryTitle(title);
		history.setHistoryContent(content);
		history.setProgress(progress);

		taskHistoryDao.save(history);
	}

	@Override
	public Map<String, Object> getWorkcationSchedule(
	        LocalDate date,
	        int empNo
	) {

	    LocalDateTime startOfDay =
	            date.atStartOfDay();

	    LocalDateTime endOfDay =
	            date.plusDays(1)
	                    .atStartOfDay()
	                    .minusNanos(1);

	    List<WorkcationInfo> list =
	            workcationDao.findWorkcationByDate(
	                    startOfDay,
	                    endOfDay
	            );

	    List<Map<String, Object>> mySchedule =
	            new ArrayList<>();

	    List<Map<String, Object>> departmentSchedule =
	            new ArrayList<>();

	    for (WorkcationInfo workcation : list) {

	        Employee employee =
	                workcation.getEmployee();

	        if (employee == null) {
	            continue;
	        }

	        Map<String, Object> schedule =
	                new HashMap<>();

	        schedule.put(
	                "workcationNo",
	                workcation.getWorkcationNo()
	        );

	        schedule.put(
	                "empNo",
	                employee.getEmpNo()
	        );

	        schedule.put(
	                "empName",
	                employee.getEmpName()
	        );

	        schedule.put(
	                "startAt",
	                workcation.getStartAt()
	        );

	        schedule.put(
	                "endAt",
	                workcation.getEndAt()
	        );

	        if (employee.getEmpNo() == empNo) {

	            mySchedule.add(schedule);

	        } else {

	            departmentSchedule.add(schedule);
	        }
	    }

	    Map<String, Object> result =
	            new HashMap<>();

	    result.put(
	            "mySchedule",
	            mySchedule
	    );

	    result.put(
	            "departmentSchedule",
	            departmentSchedule
	    );

	    return result;
	}
}
