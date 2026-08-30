package com.kh.workflow.workcation.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

	// 워케이션 목록 조회
	@GetMapping("/list")
	public ResponseEntity<Map<String, Object>> selectWorkcationList(
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,
			@RequestParam(value="condition", defaultValue="all")String condition,
			@RequestParam(value="keyword",defaultValue="")String keyword,
			@RequestParam(value="mainRegion", defaultValue="") String mainRegion,
			@RequestParam(value="subRegion", defaultValue="")String subRegion,
			@RequestParam(value="searchType", defaultValue="all")String searchType){

		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		Page<WorkcationInfo> pageResult = workcationService.selectWorkcationList(pageable);

		Map<String, Object> map = new HashMap<>();
		map.put("list", pageResult.getContent());
		map.put("currentPage", currentPage);
		map.put("totalPages", pageResult.getTotalPages());
		map.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(map);
	}
	
	@GetMapping("/hub/list")
	public ResponseEntity<List<com.kh.workflow.hub.model.vo.Hub>> selectHubList(
			@RequestParam(value="mainRegion", defaultValue="") String mainRegion,
			@RequestParam(value="subRegion", defaultValue="") String subRegion,
			@RequestParam(value="hubType", defaultValue="0") int hubType) {

		// hubDao를 이용해 DB의 거점(workcation_hub) 테이블을 조회합니다.
		List<com.kh.workflow.hub.model.vo.Hub> list = hubDao.findByMainRegionAndSubRegionAndHubType(mainRegion, subRegion, hubType);

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
	
	@PostMapping("/enrollForm")
	public ResponseEntity<String> insertWorkcationEnroll(@RequestBody Map<String, Object> paramMap){
		
		int empNo=1001;
		paramMap.put("empNo",empNo);
		
		workcationService.insertWorkcationEnroll(paramMap);
		return ResponseEntity.ok("신청 완료");
	}

}