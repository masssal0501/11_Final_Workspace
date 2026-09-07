package com.kh.workflow.workcation.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.service.WorkcationService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
@RestController
@RequestMapping("/workcation")
public class WorkcationController {

	@Autowired
	private WorkcationService workcationService;

	// 직접 허브에 박아버리기
	@Autowired
	private com.kh.workflow.hub.model.dao.HubDao hubDao;
	
	@Autowired
	private com.kh.workflow.employee.model.dao.EmployeeDao employeeDao;

	// 워케이션 목록 조회
	@GetMapping("/list")
	public ResponseEntity<?> selectWorkcationList(
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,
			@RequestParam(value = "condition", defaultValue = "all") String condition,
			@RequestParam(value = "keyword", defaultValue = "") String keyword,
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@RequestParam(value = "searchType", defaultValue = "all") String searchType,
			Authentication authentication) {
		
		if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
			return ResponseEntity.status(401).body("로그인이 필요합니다.");
		}		
		
		String empId = (String) authentication.getPrincipal();
		Employee employee = employeeDao.findByEmpId(empId)
				.orElseThrow(()-> new RuntimeException("회원 정보를 찾을 수 없습니다."));
		
		int empNo = employee.getEmpNo();
				
		Pageable pageable = PageRequest.of(currentPage - 1, 10);
		Map<String, Object> paramMap = new HashMap<>();
		paramMap.put("mainRegion", mainRegion);
		paramMap.put("subRegion", subRegion);
		paramMap.put("condition", condition);
		paramMap.put("keyword", keyword);
		paramMap.put("searchType", searchType);	
		paramMap.put("empNo", empNo);

		Page<Map<String, Object>> pageResult = workcationService.selectWorkcationList(paramMap, pageable);

		Map<String, Object> map = new HashMap<>();
		map.put("list", pageResult.getContent());
		map.put("currentPage", currentPage);
		map.put("totalPages", pageResult.getTotalPages());
		map.put("totalElements", pageResult.getTotalElements());		

		return ResponseEntity.ok(map);
	}

	@GetMapping("/mylist")
	public ResponseEntity<?> selectMyWorkcationList(
	        @RequestParam(value = "cpage", defaultValue = "1") int currentPage,
	        @RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
	        @RequestParam(value = "subRegion", defaultValue = "") String subRegion,
	        @RequestParam(value = "searchType", defaultValue = "all") String searchType,
	        Authentication authentication
	) {

	    // 로그인 확인
	    if (authentication == null ||
	        !authentication.isAuthenticated() ||
	        "anonymousUser".equals(authentication.getPrincipal())) {

	        return ResponseEntity
	                .status(401)
	                .body("로그인이 필요합니다.");
	    }

	    // JWT에서 로그인한 empId
	    String empId =
	            (String) authentication.getPrincipal();

	    // empId -> Employee
	    Employee employee =
	            employeeDao.findByEmpId(empId)
	                    .orElseThrow(() ->
	                            new RuntimeException(
	                                    "회원 정보를 찾을 수 없습니다."
	                            )
	                    );

	    // 현재 로그인한 사원 번호
	    int empNo = employee.getEmpNo();

	    Pageable pageable =
	            PageRequest.of(currentPage - 1, 10);

	    Map<String, Object> paramMap =
	            new HashMap<>();

	    paramMap.put("empNo", empNo);
	    paramMap.put("mainRegion", mainRegion);
	    paramMap.put("subRegion", subRegion);
	    paramMap.put("searchType", searchType);

	    Page<Map<String, Object>> pageResult =
	            workcationService.selectMyWorkcationList(
	                    paramMap,
	                    pageable
	            );

	    Map<String, Object> result =
	            new HashMap<>();

	    result.put(
	            "list",
	            pageResult.getContent()
	    );

	    result.put(
	            "currentPage",
	            currentPage
	    );

	    result.put(
	            "totalPages",
	            pageResult.getTotalPages()
	    );

	    result.put(
	            "totalElements",
	            pageResult.getTotalElements()
	    );

	    return ResponseEntity.ok(result);
	}	
	
	@GetMapping("/mydetail/{workcationNo}")
	public ResponseEntity<?> getMyWorkcationDetail(
	        @PathVariable Integer workcationNo,
	        Authentication authentication
	) {

	    if (authentication == null ||
	        !authentication.isAuthenticated() ||
	        "anonymousUser".equals(authentication.getPrincipal())) {

	        return ResponseEntity
	                .status(401)
	                .body("로그인이 필요합니다.");
	    }

	    String empId =
	            (String) authentication.getPrincipal();

	    Employee employee =
	            employeeDao.findByEmpId(empId)
	                    .orElseThrow(() ->
	                            new RuntimeException(
	                                    "회원 정보를 찾을 수 없습니다."
	                            )
	                    );

	    Map<String, Object> result =
	            workcationService.getMyWorkcationDetail(
	                    workcationNo,
	                    employee.getEmpNo()
	            );

	    return ResponseEntity.ok(result);
	}
	
	@GetMapping("/hub/list")
	public ResponseEntity<List<com.kh.workflow.hub.model.vo.Hub>> selectHubList(
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@RequestParam(value = "hubType", defaultValue = "0") int hubType) {

		// hubDao를 이용해 DB의 거점(workcation_hub) 테이블을 조회합니다.
		List<com.kh.workflow.hub.model.vo.Hub> list = hubDao.findByMainRegionAndSubRegionAndHubType(mainRegion,
				subRegion, hubType);

		return ResponseEntity.ok(list);
	}

	// 메인지역 드롭에 따른 목록 조회
	@GetMapping("/hub/mainRegion")
	public ResponseEntity<List<String>> getMainRegionList() {
		List<String> list = hubDao.selectMainRegionList();
		return ResponseEntity.ok(list);
	}

	// 상세지역 드롭에 따른 목록 조회
	@GetMapping("/hub/subRegion")
	public ResponseEntity<List<String>> getSubRegionList(@RequestParam String mainRegion) {
		List<String> list = hubDao.selectSubRegionList(mainRegion);
		return ResponseEntity.ok(list);
	}

	// 워켕션 신청등록 폼
	@PostMapping("/hub/enrollForm")
	public ResponseEntity<String> insertWorkcationEnrollForm(
				@RequestBody Map<String, Object> paramMap,
				Authentication authentication) {

		String empId = (String) authentication.getPrincipal();	
	
		Employee employee = employeeDao.findByEmpId(empId)
		    .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
	
		int empNo = employee.getEmpNo(); 
		paramMap.put("empNo", empNo);

		workcationService.insertWorkcationEnrollForm(paramMap);
		return ResponseEntity.ok("신청 완료");
	}

	// 회사 지원금 정보 조회 API추가
	@GetMapping("/amount/supportInfo")
	public ResponseEntity<Map<String, Object>> getAmountSupportInfo() {
		Map<String, Object> supportInfo = workcationService.getAmountSupportInfo();
		return ResponseEntity.ok(supportInfo);
	}

	@GetMapping("/detail/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getWorkcationDetail(@PathVariable("workcationNo") Integer workcationNo) {

		Map<String, Object> detail = workcationService.getWorkcationDetail(workcationNo);
		return ResponseEntity.ok(detail);
	}
	
	@PutMapping("update/{workcationNo}")
	public ResponseEntity<String> update(
			@PathVariable Integer workcationNo,
			@RequestBody Map<String, Object> updateData){
		workcationService.updateWorkcation(workcationNo, updateData);
		return ResponseEntity.ok("수정완료");
	}

	@DeleteMapping("/delete/{workcationNo}")
	public ResponseEntity<Void> deleteWorkcation(
					@PathVariable("workcationNo") Integer workcationNo){
		workcationService.deleteWorkcation(workcationNo);
		return ResponseEntity.ok().build();
	}
	
	@PutMapping("/task/{taskNo}")
	public ResponseEntity<?> updateTask(
			@PathVariable Integer taskNo,
			@RequestParam Integer progress,
			@RequestParam String title,
			@RequestParam String content,
			@RequestParam(required = false) MultipartFile file){
		
		workcationService.updateTask(
										taskNo,
										progress,
										title,
										content,
										file);
		
		
		return ResponseEntity.ok("업무 진행 상황 저장 완료");
	}
	
	@GetMapping("/schedule")
	public ResponseEntity<?> getWorkcationSchedule(
	        @RequestParam String date,
	        Authentication authentication) {

	    String empId = (String) authentication.getPrincipal();

	    Employee employee = employeeDao.findByEmpId(empId)
	            .orElseThrow(() ->
	                    new RuntimeException("회원 정보를 찾을 수 없습니다.")
	            );

	    LocalDate selectedDate = LocalDate.parse(date);

	    Map<String, Object> result =
	            workcationService.getWorkcationSchedule(
	                    selectedDate,
	                    employee.getEmpNo()
	            );

	    return ResponseEntity.ok(result);
	}

}