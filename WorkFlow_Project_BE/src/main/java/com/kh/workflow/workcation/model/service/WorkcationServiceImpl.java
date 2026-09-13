package com.kh.workflow.workcation.model.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.dao.AmountItemDao;
import com.kh.workflow.amount.dao.SupportListDao;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.reservation.model.dao.ReservationDao;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.task.model.dao.TaskHistoryDao;
import com.kh.workflow.task.model.dao.WorkDao;
import com.kh.workflow.task.model.dao.WorkFileDao;
import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.TaskHistory;
import com.kh.workflow.task.model.vo.Work;
import com.kh.workflow.task.model.vo.WorkFile;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
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

	@Autowired
	private WorkFileDao workFileDao;

	@Autowired
	private EmployeeDao employeeDao;

	@Override
	public Page<Map<String, Object>> selectWorkcationList(Map<String, Object> paramMap, Pageable pageable) {

		int empNo = (int) paramMap.get("empNo");
		String authCode = (String) paramMap.get("authCode");
		String depId = (String) paramMap.get("depId");

		// 1. 오라클 DB용 빈문자열 NULL 변환
		String mainRegion = paramMap != null ? (String) paramMap.get("mainRegion") : null;
		String subRegion = paramMap != null ? (String) paramMap.get("subRegion") : null;

		if (mainRegion != null && mainRegion.trim().isEmpty()) {
			mainRegion = null;
		}
		if (subRegion != null && subRegion.trim().isEmpty()) {
			subRegion = null;
		}

		// BUG: 권한과 무관하게 항상 전체 목록이 노출되던 문제 수정.
		// STAFF는 본인 신청 건만, MANAGER는 소속 부서 신청 건만, ADMIN은 전체를 본다.
		Integer filterEmpNo = "STAFF".equals(authCode) ? empNo : null;
		String filterDepId = "MANAGER".equals(authCode) ? depId : null;

		// 2. 검색 조건 + 권한 조건이 함께 적용된 JPQL 쿼리 호출 (findAll 대신 적용)
		Page<WorkcationInfo> page = workcationDao.searchWorkcationList(mainRegion, subRegion, filterEmpNo, filterDepId,
				pageable);

		// 람다식에서 참조하려면 effectively final이어야 하므로 별도 변수로 고정
		final String filterMainRegion = mainRegion;
		final String filterSubRegion = subRegion;

		return page.map(workcation -> {
			Map<String, Object> map = new HashMap<>();
			map.put("workcationNo", workcation.getWorkcationNo());
			map.put("workcationTitle", workcation.getWorkcationTitle());
			map.put("createdAt", workcation.getCreatedAt());
			map.put("approverState", workcation.getApproverState());
			map.put("employee", workcation.getEmployee());

			// 3. 람다식 내부 변수명 중복 해결 (hubMainRegion, hubSubRegion으로 변경)
			// BUG: 워케이션 1건에 예약(Reservation)이 여러 건 있는 경우, 지역 필터
			// 조건과 무관하게 항상 "첫 번째" 예약의 거점 지역만 표시하고 있었다.
			// 그 결과 mainRegion/subRegion으로 필터링해도 목록에는 필터 조건과
			// 다른 지역이 노출되는 경우가 있었다(검색 자체는 예약 중 하나라도
			// 매칭되면 해당 워케이션을 반환하기 때문). 필터가 걸려 있으면 그
			// 필터와 실제로 일치하는 예약의 거점을 우선 표시한다.
			List<Reservation> reservations = reservationDao.findByWorkcationWorkcationNo(workcation.getWorkcationNo());
			String hubMainRegion = "";
			String hubSubRegion = "";

			if (reservations != null && !reservations.isEmpty()) {

				Hub matchedHub = null;
				Hub firstHub = null;

				for (Reservation r : reservations) {

					if (r.getHub() == null) {
						continue;
					}

					Hub hub = hubDao.findById(r.getHub().getHubNo()).orElse(null);

					if (hub == null) {
						continue;
					}

					if (firstHub == null) {
						firstHub = hub;
					}

					boolean matchesMain = filterMainRegion == null || filterMainRegion.equals(hub.getMainRegion());
					boolean matchesSub = filterSubRegion == null || filterSubRegion.equals(hub.getSubRegion());

					if (matchesMain && matchesSub) {
						matchedHub = hub;
						break;
					}
				}

				Hub hub = matchedHub != null ? matchedHub : firstHub;

				if (hub != null) {
					hubMainRegion = hub.getMainRegion() != null ? hub.getMainRegion() : "";
					hubSubRegion = hub.getSubRegion() != null ? hub.getSubRegion() : "";
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

		// BUG-009: 업무계획을 workcation_info.work_plan 텍스트로만 저장하고 실제
		// work/task 레코드를 만들지 않아, "내 워케이션" 화면의 업무 진행률 변경이
		// 동작할 수 없었다(진행률을 저장할 실제 task_no가 존재하지 않았음). 신청 시점에
		// 실제 Work 1건 + 업무계획 항목별 Task를 생성해 진행률 추적이 가능하도록 한다.
		if (planList != null && !planList.isEmpty()) {

			Work work = new Work();
			work.setWorkcationInfo(workcation);
			work = workDao.save(work);

			for (Map<String, Object> planItem : planList) {
				String taskName = (String) planItem.get("taskName");
				Object daysObj = planItem.get("days");
				int days = daysObj != null ? Integer.parseInt(daysObj.toString()) : 1;

				Task task = new Task();
				task.setWork(work);
				task.setTaskTitle(taskName);
				task.setTaskContent(taskName + " (" + days + "일)");
				task.setTasktimeAt(startAt);
				task.setTaskendAt(startAt.plusDays(days));
				task.setProgress(0);
				task.setStatus("N");
				taskDao.save(task);
			}
		}

		// Hub 객체 조회 (Reservation이 Hub 연관관계를 갖도록 바뀌어 실제 엔티티가 필요)
		Hub hub = (hubNo != null) ? hubDao.findById(hubNo).orElse(null) : null;

		Object peopleCountObj = paramMap.get("peopleCount");
		Integer peopleCount = peopleCountObj != null ? Integer.parseInt(peopleCountObj.toString()) : 1;

		Reservation reservation = new Reservation();

		reservation.setWorkcation(workcation);
		reservation.setHub(hub);
		reservation.setUserCapacity(peopleCount);
		reservation.setRsvStart(startAt);
		reservation.setRsvEnd(endAt);
		reservation.setRsvStatus("N");

		reservationDao.save(reservation);

		// 프로그램 / 맛집 / 관광지 옵션 예약 저장
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> options = (List<Map<String, Object>>) paramMap.get("options");

		if (options != null) {

			for (Map<String, Object> optionMap : options) {

				Object optionHubNoObj = optionMap.get("hubNo");
				Object visitDateObj = optionMap.get("visitDate");

				if (optionHubNoObj == null || optionHubNoObj.toString().trim().isEmpty()) {
					continue;
				}

				Integer optionHubNo = Integer.parseInt(optionHubNoObj.toString());

				LocalDateTime visitDate = parseDateSafely(visitDateObj, startAt);

				Hub optionHub = hubDao.findById(optionHubNo).orElse(null);

				if (optionHub == null) {
					continue;
				}

				Reservation optionReservation = new Reservation();

				optionReservation.setWorkcation(workcation);
				optionReservation.setHub(optionHub);
				optionReservation.setUserCapacity(peopleCount);
				optionReservation.setRsvStart(visitDate);
				optionReservation.setRsvEnd(visitDate);

				reservationDao.save(optionReservation);
			}
		}

		// 프론트에서 넘어온 총 지원금(예상금액)
		Amount amount = new Amount();
		amount.setWorkcationNo(workcation.getWorkcationNo());

		Integer approvedAmount = 0;
		if (paramMap.get("totalSupport") != null) {
			approvedAmount = Integer.parseInt(paramMap.get("totalSupport").toString());
		}

		amount.setApprovedAmount(approvedAmount);

		// amount.requested_amount는 NOT NULL 컬럼인데 설정이 누락되어 있었음(BUG-003).
		// 프론트가 신청 시점에 계산해 보내는 실제 지출 총액(totalCost)을 사용한다.
		Integer requestedAmount = 0;
		if (paramMap.get("totalCost") != null) {
			requestedAmount = Integer.parseInt(paramMap.get("totalCost").toString());
		}
		amount.setRequestedAmount(requestedAmount);

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
		List<Reservation> reservationList = reservationDao.findByWorkcationWorkcationNo(workcation.getWorkcationNo());

		Hub mainHub = null;
		Reservation mainReservation = null;
		List<Map<String, Object>> optionList = new ArrayList<>();

		if (reservationList != null) {
			for (Reservation reservation : reservationList) {

				Hub hub = null;

				if (reservation.getHub() != null) {
					hub = hubDao.findById(reservation.getHub().getHubNo()).orElse(null);
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
		// BUG-008: 상세 화면이 승인 상태를 표시하지 못해 항상 "신청 완료"로 고정 노출되던
		// 문제의 근본 원인 - 이 맵에 approverState 자체가 빠져 있었음.
		result.put("writerEmpNo", workcation.getEmployee() != null ? workcation.getEmployee().getEmpNo() : null);

		result.put("approverState", workcation.getApproverState());
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

		// BUG-009 수정: workPlan 텍스트를 매 요청마다 파싱해 매번 새로운 임의 id를
		// 부여하던 방식(진행률 저장이 원천적으로 불가능했음) 대신, 실제 Work/Task
		// 레코드를 조회해 진짜 taskNo/progress를 반환한다. "[근무 목적] ..." 부분만
		// 여전히 텍스트에서 추출한다(별도 컬럼이 없음).
		List<Map<String, Object>> planList = new ArrayList<>();
		String workPlan = workcation.getWorkPlan();
		String actualPurpose = "";

		if (workPlan != null && workPlan.startsWith("[근무 목적]")) {
			int sepIdx = workPlan.indexOf(" / ");
			String purposeToken = sepIdx != -1 ? workPlan.substring(0, sepIdx) : workPlan;
			actualPurpose = purposeToken.replace("[근무 목적]", "").trim();
		}

		// 워케이션 1건에 Work가 여러 건(예: 날짜별 근무) 있을 수 있으므로 전부 순회한다.
		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcation.getWorkcationNo());
		for (Work work : workList) {
			List<Task> taskList = taskDao.findByWork_WorkNo(work.getWorkNo());
			for (Task task : taskList) {
				long days = 1;
				if (task.getTasktimeAt() != null && task.getTaskendAt() != null) {
					days = java.time.temporal.ChronoUnit.DAYS.between(task.getTasktimeAt().toLocalDate(),
							task.getTaskendAt().toLocalDate());
				}
				Map<String, Object> planMap = new HashMap<>();
				planMap.put("id", task.getTaskNo());
				planMap.put("taskNo", task.getTaskNo());
				planMap.put("taskName", task.getTaskTitle());
				planMap.put("taskContent", task.getTaskContent());
				planMap.put("progress", task.getProgress());
				planMap.put("status", task.getStatus());
				planMap.put("days", days);
				planList.add(planMap);
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

		// 업무
		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

		Work work;

		if (workList.isEmpty()) {
			work = new Work();
			work.setWorkcationInfo(workcation);
			work.setSubmittedAt(LocalDateTime.now());
			work = workDao.save(work);
		} else {
			work = workList.get(0);
		}

		List<Task> existingTasks = taskDao.findByWorkWorkNo(work.getWorkNo());

		if (planList != null) {
			for (Map<String, Object> planItem : planList) {

				String taskName = (String) planItem.get("taskName");

				if (taskName == null || taskName.trim().isEmpty()) {
					continue;
				}
				boolean exists = existingTasks.stream().anyMatch(task -> taskName.equals(task.getTaskTitle()));

				if (!exists) {

					Task task = new Task();

					task.setTaskTitle(taskName);
					task.setTaskContent("");
					task.setTasktimeAt(LocalDateTime.now());
					task.setProgress(0);
					task.setStatus("N");
					task.setWork(work);

					taskDao.save(task);
					existingTasks.add(task);

				}
			}
		}

		// 2. 예약(Reservation) 정보 수정 (기존 예약 삭제 후 메인+옵션 재등록)
		List<Reservation> existingRsvs = reservationDao.findByWorkcationWorkcationNo(workcation.getWorkcationNo());
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

				mainRsv.setWorkcation(workcation);
				mainRsv.setHub(hubDao.findById(mainHubNo).orElse(null));
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
						optionRsv.setHub(hubDao.findById(optionHubNo).orElse(null));
						optionRsv.setWorkcation(workcation);
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

		// 업무
		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

		for (Work work : workList) {

			List<Task> taskList = taskDao.findByWorkWorkNo(work.getWorkNo());

			for (Task task : taskList) {

				List<TaskHistory> historyList = taskHistoryDao.findByTaskTaskNoOrderByCreatedAtDesc(task.getTaskNo());

				taskHistoryDao.deleteAll(historyList);
			}

			taskDao.deleteAll(taskList);
		}

		workDao.deleteAll(workList);

		// 예약
		List<Reservation> reservationList = reservationDao.findByWorkcationWorkcationNo(workcationNo);

		if (reservationList != null && !reservationList.isEmpty()) {
			reservationDao.deleteAll(reservationList);
		}

		// 비용
		List<Amount> amountList = amountDao.findByWorkcationNo(workcationNo);

		if (amountList != null && !amountList.isEmpty()) {

			amountDao.deleteAll(amountList);
		}

		// 워케이션
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
			List<Reservation> reservations = reservationDao.findByWorkcationWorkcationNo(workcation.getWorkcationNo());

			String main = "";
			String sub = "";

			if (reservations != null && !reservations.isEmpty()) {

				for (Reservation reservation : reservations) {

					if (reservation.getHub() == null) {
						continue;
					}

					Hub hub = hubDao.findById(reservation.getHub().getHubNo()).orElse(null);

					if (hub == null) {
						continue;
					}

					int hubType = hub.getHubType();

					// 메인 거점 또는 숙소
					if (hubType == 1 || hubType == 2) {

						main = hub.getMainRegion() != null ? hub.getMainRegion() : "";

						sub = hub.getSubRegion() != null ? hub.getSubRegion() : "";

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

		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

		List<Map<String, Object>> taskList = new ArrayList<>();
		List<Map<String, Object>> historyList = new ArrayList<>();
		List<Map<String, Object>> fileList = new ArrayList<>();

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

				// BUG: WorkFile은 work_no가 아니라 task_no로 Task를 참조하므로 task 단위로 조회한다.
				List<WorkFile> files = workFileDao.findByTaskTaskNo(task.getTaskNo());

				for (WorkFile file : files) {

					if (!"Y".equals(file.getStatus())) {
						continue;
					}

					Map<String, Object> fileMap = new HashMap<>();

					fileMap.put("taskFileNo", file.getTaskFileNo());
					fileMap.put("originName", file.getOriginName());
					fileMap.put("changeName", file.getChangeName());
					fileMap.put("filePath", file.getFilePath());
					fileMap.put("fileSize", file.getFileSize());
					fileList.add(fileMap);
				}
			}
		}
		result.put("planList", taskList);
		result.put("historyList", historyList);

		fileList.sort(Comparator.comparing(item -> (Integer) item.get("taskFileNo")));

		result.put("fileList", fileList);

		return result;
	}

	@Transactional
	@Override
	public void updateTask(Integer taskNo, Integer progress, String title, String content, MultipartFile file) {

		Task task = taskDao.findById(taskNo).orElseThrow(() -> new RuntimeException("업무를 찾을수 없습니다."));

		// BUG-09: 워케이션 승인 기간이 끝난 뒤에도 업무계획(업무보고) 수정 API를 계속
		// 호출할 수 있었다 - 프런트에서 버튼을 숨기더라도 API를 직접 호출하면 우회
		// 가능하므로 백엔드에서도 기간을 검증한다.
		if (task.getWork() != null && task.getWork().getWorkcationInfo() != null) {
			WorkcationInfo periodCheckWorkcation = task.getWork().getWorkcationInfo();
			LocalDateTime now = LocalDateTime.now();

			if (periodCheckWorkcation.getEndAt() != null && now.isAfter(periodCheckWorkcation.getEndAt())) {
				throw new IllegalArgumentException("워케이션 기간이 종료되어 업무를 수정할 수 없습니다.");
			}
		}

		// 진행률 검증
		if (progress < 0 || progress > 100 || progress % 5 != 0) {
			throw new IllegalArgumentException("진행률은 0~100 사이의 5단위 값");
		}

		// 기존 제목
		String oldTitle = task.getTaskTitle();

		// 업무
		task.setProgress(progress);
		task.setTaskTitle(title);
		task.setTaskContent(content);
		// 진행률이 100%가 되면 완료 처리 - TaskDao의 부서/개인 평균 진행률 통계
		// 쿼리가 status='Y' 기준으로 계산하므로 이 갱신이 없으면 통계가 항상 0으로 나온다.
		// BUG: nam_final 병합본은 이 조건이 항상 "N"만 재설정하도록 되어 있어 이 API로는
		// 업무가 영원히 완료(Y) 처리될 수 없었다(TODO-N03 최종완료 선행조건까지 막힘).
		// 단, 업무게시판(TaskController)에서 반려(R) 처리된 건은 진행률 재저장만으로
		// 조용히 초기화되지 않도록, 100%에 도달하기 전까지는 반려 상태를 유지한다.
		if ("R".equals(task.getStatus()) && progress < 100) {
			// 반려 상태 유지
		} else {
			task.setStatus(progress == 100 ? "Y" : "N");
		}

		// 워케이션 업무계획 제목 동기화
		Work work = task.getWork();

		if (work != null && work.getWorkcationInfo() != null) {
			WorkcationInfo workcation = work.getWorkcationInfo();

			String workPlan = workcation.getWorkPlan();

			if (workPlan != null && oldTitle != null && title != null && !oldTitle.equals(title)) {

				String[] tokens = workPlan.split(" / ");
				StringBuilder newPlan = new StringBuilder();

				for (String token : tokens) {
					String updatedToken = token;

					if (!token.startsWith("[근무 목적]")) {
						int idxOpen = token.lastIndexOf("(");

						if (idxOpen > 0) {
							String planTitle = token.substring(0, idxOpen).trim();

							if (planTitle.equals(oldTitle)) {
								updatedToken = title + token.substring(idxOpen);
							}
						}
					}

					if (newPlan.length() > 0) {
						newPlan.append(" / ");
					}

					newPlan.append(updatedToken);
				}

				workcation.setWorkPlan(newPlan.toString());
			}
		}

		// 최근 업무 이력 INSERT
		TaskHistory history = new TaskHistory();

		history.setTask(task);
		history.setHistoryTitle(title);
		history.setHistoryContent(content);
		history.setProgress(progress);

		taskHistoryDao.save(history);

		// 첨부파일 저장
		if (file != null && !file.isEmpty()) {

			String originName = file.getOriginalFilename();

			String extension = "";

			if (originName != null && originName.contains(".")) {
				extension = originName.substring(originName.lastIndexOf("."));
			}

			String changeName = UUID.randomUUID().toString() + extension;

			String uploadDir = System.getProperty("user.dir") + "/uploads/work/";

			File dir = new File(uploadDir);

			if (!dir.exists()) {
				dir.mkdirs();
			}

			try {
				file.transferTo(new File(uploadDir + changeName));
			} catch (IOException e) {
				throw new RuntimeException("첨부파일 저장에 실패했습니다.", e);
			}

			WorkFile workFile = new WorkFile();

			workFile.setOriginName(originName);
			workFile.setChangeName(changeName);
			workFile.setFilePath("/uploads/work/");
			workFile.setFileSize(file.getSize());
			workFile.setStatus("Y");

			// 실제 work_file 테이블은 work_no가 아닌 task_no로 task를 참조한다
			workFile.setTask(task);

			workFileDao.save(workFile);
		}
	}

	// TODO-N03: 워케이션 최종 완료 처리 - "결과보고"(업무 리포트/TaskHistory)는 이미
	// 구현되어 있었지만, 관리자/부서장이 이를 확인하고 워케이션 전체를 최종 완료로
	// 확정하는 단계가 없었다. 기존 approverState 컬럼(VARCHAR(1), CHECK 제약 없이
	// 애플리케이션 코드로만 값이 제한됨)에 새 값 'D'(완료)를 추가하는 것만으로
	// DB 스키마 변경 없이 구현 가능하다.
	@Override
	@Transactional
	public void completeWorkcation(Integer workcationNo, Employee loginEmployee) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("워케이션 정보를 찾을 수 없습니다."));

		String authCode = loginEmployee.getAuthCode();

		if (!"ADMIN".equals(authCode) && !"MANAGER".equals(authCode)) {
			throw new AccessDeniedException("관리자 또는 부서장만 완료 처리할 수 있습니다.");
		}

		if ("MANAGER".equals(authCode)) {

			Employee owner = workcation.getEmployee();

			if (owner == null || owner.getDepId() == null || !owner.getDepId().equals(loginEmployee.getDepId())) {
				throw new AccessDeniedException("소속 부서의 워케이션만 완료 처리할 수 있습니다.");
			}
		}

		if (!"A".equals(workcation.getApproverState())) {
			throw new IllegalArgumentException("승인된 워케이션만 완료 처리할 수 있습니다.");
		}

		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

		List<Task> allTasks = new ArrayList<>();

		for (Work work : workList) {
			allTasks.addAll(taskDao.findByWorkWorkNo(work.getWorkNo()));
		}

		if (allTasks.isEmpty()) {
			throw new IllegalArgumentException("등록된 업무가 없어 완료 처리할 수 없습니다.");
		}

		boolean allDone = allTasks.stream().allMatch(task -> "Y".equals(task.getStatus()));

		if (!allDone) {
			throw new IllegalArgumentException("모든 업무가 완료 상태여야 최종 완료 처리할 수 있습니다.");
		}

		workcation.setApproverState("D");
		workcation.setUpdatedAt(LocalDateTime.now());
	}

	@Override
	public Map<String, Object> getWorkcationSchedule(LocalDate date, int empNo) {

		LocalDateTime startOfDay = date.atStartOfDay();
		LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);

		List<WorkcationInfo> list = workcationDao.findWorkcationByDate(startOfDay, endOfDay);

		List<Map<String, Object>> mySchedule = new ArrayList<>();
		List<Map<String, Object>> departmentSchedule = new ArrayList<>();

		for (WorkcationInfo workcation : list) {

			Employee employee = workcation.getEmployee();

			if (employee == null) {
				continue;
			}

			String depTitle = employeeDao.selectDepTitle(employee.getDepId());

			String jobName = switch (employee.getJobCode()) {
			case "J1" -> "사원";
			case "J2" -> "대리";
			case "J3" -> "과장";
			case "J4" -> "차장";
			case "J5" -> "부장";
			default -> employee.getJobCode();
			};

			Map<String, Object> schedule = new HashMap<>();

			schedule.put("workcationNo", workcation.getWorkcationNo());
			schedule.put("empNo", employee.getEmpNo());
			schedule.put("empName", employee.getEmpName());
			schedule.put("jobName", jobName);
			schedule.put("depTitle", depTitle);
			schedule.put("startAt", workcation.getStartAt());
			schedule.put("endAt", workcation.getEndAt());

			if (employee.getEmpNo() == empNo) {
				mySchedule.add(schedule);
			} else {
				departmentSchedule.add(schedule);
			}
		}

		Map<String, Object> result = new HashMap<>();

		result.put("mySchedule", mySchedule);
		result.put("departmentSchedule", departmentSchedule);

		return result;
	}

	@Transactional
	@Override
	public void uploadWorkFile(Integer workcationNo, MultipartFile file) {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("첨부파일이 없습니다.");
		}

		List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

		if (workList.isEmpty()) {
			throw new RuntimeException("업무 정보를 찾을 수 없습니다.");
		}

		Work work = workList.get(0);

		// BUG-09: 워케이션 기간이 끝난 뒤에도 업무 첨부파일을 계속 업로드할 수 있었다.
		if (work.getWorkcationInfo() != null) {
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime endAt = work.getWorkcationInfo().getEndAt();

			if (endAt != null && now.isAfter(endAt)) {
				throw new IllegalArgumentException("워케이션 기간이 종료되어 첨부파일을 업로드할 수 없습니다.");
			}
		}

		// 실제 work_file 테이블은 work_no가 아니라 task_no로 task를 참조하므로
		// 첨부파일을 연결할 구체적인 task가 필요하다.
		List<Task> taskList = taskDao.findByWorkWorkNo(work.getWorkNo());

		if (taskList.isEmpty()) {
			throw new IllegalArgumentException("첨부파일을 연결할 업무 정보를 찾을 수 없습니다.");
		}

		Task task = taskList.get(0);

		String originName = file.getOriginalFilename();
		String extension = "";

		if (originName != null && originName.contains(".")) {
			extension = originName.substring(originName.lastIndexOf("."));
		}

		String changeName = UUID.randomUUID().toString() + extension;
		String uploadDir = System.getProperty("user.dir") + "/uploads/work/";

		File dir = new File(uploadDir);

		if (!dir.exists()) {
			dir.mkdirs();
		}

		try {
			file.transferTo(new File(uploadDir + changeName));
		} catch (IOException e) {
			throw new RuntimeException("파일 저장 실패", e);
		}

		WorkFile workFile = new WorkFile();

		workFile.setTask(task);
		workFile.setOriginName(originName);
		workFile.setChangeName(changeName);
		workFile.setFilePath("/uploads/work/");
		workFile.setFileSize(file.getSize());
		workFile.setStatus("Y");

		workFileDao.save(workFile);
	}

	@Transactional
	@Override
	public void deleteWorkFile(Integer taskFileNo) {
		WorkFile workFile = workFileDao.findById(taskFileNo)
				.orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다."));

		// BUG-09: 워케이션 기간이 끝난 뒤에도 업무 첨부파일을 계속 삭제할 수 있었다.
		if (workFile.getTask() != null && workFile.getTask().getWork() != null
				&& workFile.getTask().getWork().getWorkcationInfo() != null) {
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime endAt = workFile.getTask().getWork().getWorkcationInfo().getEndAt();

			if (endAt != null && now.isAfter(endAt)) {
				throw new IllegalArgumentException("워케이션 기간이 종료되어 첨부파일을 삭제할 수 없습니다.");
			}
		}

		File file = new File(System.getProperty("user.dir") + workFile.getFilePath() + workFile.getChangeName());

		if (file.exists()) {
			file.delete();
		}

		workFileDao.delete(workFile);
	}
}
