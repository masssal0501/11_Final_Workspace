package com.kh.workflow.workcation.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// CORS는 SecurityConfig에서 app.cors.allowed-origins 기준으로 중앙 관리한다
// (여기서 개별 @CrossOrigin을 두면 환경별 origin 설정과 어긋날 수 있어 제거함)
@Tag(name = "워케이션 관리", description = "워케이션 신청/목록/상세 조회, 거점(hub) 조회, 지원금 정보, 업무 진행 상황 등록 관련 API (인증된 사용자만 이용 가능)")
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
	@Operation(summary = "워케이션 목록 조회", description = "지역/조건/키워드로 검색한 전체 워케이션 신청 목록을 페이징 조회합니다. 로그인한 사용자만 이용할 수 있습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/list")
	public ResponseEntity<?> selectWorkcationList(
			@Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,
			@Parameter(description = "검색 조건", example = "all")
			@RequestParam(value = "condition", defaultValue = "all") String condition,
			@Parameter(description = "검색 키워드(선택)", example = "")
			@RequestParam(value = "keyword", defaultValue = "") String keyword,
			@Parameter(description = "메인 지역 필터(선택)", example = "제주도")
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@Parameter(description = "검색 대상 유형", example = "all")
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

	@Operation(summary = "내 워케이션 목록 조회", description = "로그인한 본인이 신청한 워케이션 목록을 지역/검색 조건으로 페이징 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/mylist")
	public ResponseEntity<?> selectMyWorkcationList(
	        @Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
	        @RequestParam(value = "cpage", defaultValue = "1") int currentPage,
	        @Parameter(description = "메인 지역 필터(선택)", example = "제주도")
	        @RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
	        @Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
	        @RequestParam(value = "subRegion", defaultValue = "") String subRegion,
	        @Parameter(description = "검색 대상 유형", example = "all")
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
	
	@Operation(summary = "내 워케이션 상세 조회", description = "로그인한 본인이 신청한 워케이션의 상세 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/mydetail/{workcationNo}")
	public ResponseEntity<?> getMyWorkcationDetail(
	        @Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
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
	
	@Operation(summary = "워케이션 신청용 거점 목록 조회", description = "워케이션 신청 화면에서 지역/유형 조건으로 선택 가능한 거점(hub) 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/list")
	public ResponseEntity<List<com.kh.workflow.hub.model.vo.Hub>> selectHubList(
			@Parameter(description = "메인 지역 필터(선택)", example = "제주도")
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@Parameter(description = "거점 유형 코드(0: 전체)", example = "0")
			@RequestParam(value = "hubType", defaultValue = "0") int hubType) {

		// hubDao를 이용해 DB의 거점(workcation_hub) 테이블을 조회합니다.
		List<com.kh.workflow.hub.model.vo.Hub> list = hubDao.findByMainRegionAndSubRegionAndHubType(mainRegion,
				subRegion, hubType);

		return ResponseEntity.ok(list);
	}

	// 메인지역 드롭에 따른 목록 조회
	@Operation(summary = "메인 지역 드롭다운 목록 조회", description = "워케이션 신청/검색 화면의 메인 지역 드롭다운을 채우기 위한 지역명 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/mainRegion")
	public ResponseEntity<List<String>> getMainRegionList() {
		List<String> list = hubDao.selectMainRegionList();
		return ResponseEntity.ok(list);
	}

	// 상세지역 드롭에 따른 목록 조회
	@Operation(summary = "세부 지역 드롭다운 목록 조회", description = "선택한 메인 지역에 속한 세부 지역명 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/subRegion")
	public ResponseEntity<List<String>> getSubRegionList(
			@Parameter(description = "세부 지역을 조회할 메인 지역명", example = "제주도", required = true)
			@RequestParam String mainRegion) {
		List<String> list = hubDao.selectSubRegionList(mainRegion);
		return ResponseEntity.ok(list);
	}

	// 워켕션 신청등록 폼
	@Operation(summary = "워케이션 신청 등록", description = "선택한 거점/기간 등 정보를 바탕으로 새 워케이션 신청서를 등록합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "신청 완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PostMapping("/hub/enrollForm")
	public ResponseEntity<String> insertWorkcationEnrollForm(
				@Parameter(description = "워케이션 신청 정보(거점, 기간 등 키-값 쌍)", required = true)
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
	@Operation(summary = "회사 지원금 정보 조회", description = "워케이션 신청 시 안내되는 회사 지원금(1인당 지원 한도 등) 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/amount/supportInfo")
	public ResponseEntity<Map<String, Object>> getAmountSupportInfo() {
		Map<String, Object> supportInfo = workcationService.getAmountSupportInfo();
		return ResponseEntity.ok(supportInfo);
	}

	@Operation(summary = "워케이션 상세 조회", description = "워케이션 번호로 신청/승인/거점 등 상세 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/detail/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getWorkcationDetail(
			@Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
			@PathVariable("workcationNo") Integer workcationNo) {

		Map<String, Object> detail = workcationService.getWorkcationDetail(workcationNo);
		return ResponseEntity.ok(detail);
	}

	@Operation(summary = "워케이션 정보 수정", description = "워케이션 신청 정보를 수정합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "수정완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PutMapping("update/{workcationNo}")
	public ResponseEntity<String> update(
			@Parameter(description = "수정할 워케이션 번호", example = "1", required = true)
			@PathVariable Integer workcationNo,
			@Parameter(description = "수정할 워케이션 정보(키-값 쌍)", required = true)
			@RequestBody Map<String, Object> updateData){
		workcationService.updateWorkcation(workcationNo, updateData);
		return ResponseEntity.ok("수정완료");
	}

	@Operation(summary = "워케이션 삭제", description = "워케이션 신청 건을 삭제합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "삭제 성공(본문 없음)"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@DeleteMapping("/delete/{workcationNo}")
	public ResponseEntity<Void> deleteWorkcation(
					@Parameter(description = "삭제할 워케이션 번호", example = "1", required = true)
					@PathVariable("workcationNo") Integer workcationNo){
		workcationService.deleteWorkcation(workcationNo);
		return ResponseEntity.ok().build();
	}

	@Operation(summary = "워케이션 업무 진행 상황 저장", description = "워케이션 중 수행한 업무의 진행률/제목/내용을 저장하고, 증빙 파일을 함께 첨부할 수 있습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "업무 진행 상황 저장 완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PutMapping("/task/{taskNo}")
	public ResponseEntity<?> updateTask(
			@Parameter(description = "업무 번호", example = "1", required = true)
			@PathVariable Integer taskNo,
			@Parameter(description = "업무 진행률(%)", example = "50", required = true)
			@RequestParam Integer progress,
			@Parameter(description = "업무 제목", example = "1주차 업무 보고서", required = true)
			@RequestParam String title,
			@Parameter(description = "업무 내용", example = "이번 주 진행한 업무 내용입니다.", required = true)
			@RequestParam String content,
			@Parameter(description = "업무 증빙 첨부파일(선택)")
			@RequestParam(required = false) MultipartFile file){

		workcationService.updateTask(
										taskNo,
										progress,
										title,
										content,
										file);
		return ResponseEntity.ok("업무 진행 상황 저장 완료");
	}

}