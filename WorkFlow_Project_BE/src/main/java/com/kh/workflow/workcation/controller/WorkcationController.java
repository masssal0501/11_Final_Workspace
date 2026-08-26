package com.kh.workflow.workcation.controller;

import java.util.HashMap;
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
import com.kh.workflow.workcation.model.vo.Workcation;

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

		Pageable pageable = PageRequest.of(currentPage - 1,  10);

		Page<Workcation> pageResult = workcationService.selectWorkcationList(pageable);
		
		Map<String, Object> map = new HashMap<>();
		map.put("list", pageResult.getContent());
		map.put("currentPage", currentPage);
		map.put("totalPages", pageResult.getTotalPages());
		map.put("totalElements", pageResult.getTotalElements());
		
		return ResponseEntity.ok(map);

	}

}
