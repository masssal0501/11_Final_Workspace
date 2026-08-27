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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.workcation.model.service.WorkcationService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@CrossOrigin
@RestController
@RequestMapping("/workcation")
public class WorkcationController {

	@Autowired
	private WorkcationService workcationService;

	// 워케이션 목록 조회
	@GetMapping("/list")
	public ResponseEntity<Map<String, Object>> selectWorkcationList(
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage) {

		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		Page<WorkcationInfo> pageResult = workcationService.selectWorkcationList(pageable);

		Map<String, Object> map = new HashMap<>();
		map.put("list", pageResult.getContent());
		map.put("currentPage", currentPage);
		map.put("totalPages", pageResult.getTotalPages());
		map.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(map);
	}

	// 메인지역 드롭에 따른 목록 조회
	@GetMapping("/api/hub/main-regions")
	public ResponseEntity<List<String>> getMainRegions() {
		List<String> mainRegions = workcationService.selectMainRegion();
		return ResponseEntity.ok(mainRegions);
	}

	// 상세지역 드롭에 따른 목록 조회
	@GetMapping("/api/hub/sub-regions")
	public ResponseEntity<List<String>> getSubRegions(@RequestParam String mainRegion) {
		List<String> subRegions = workcationService.selectSubRegions(mainRegion);
		return ResponseEntity.ok(subRegions);
	}
}