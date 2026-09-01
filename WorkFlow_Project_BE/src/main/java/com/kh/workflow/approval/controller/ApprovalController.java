package com.kh.workflow.approval.controller;

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

import com.kh.workflow.approval.model.service.ApprovalService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@CrossOrigin
@RestController
@RequestMapping("/workcation")
public class ApprovalController {
	
	@Autowired
	private ApprovalService approvalService;
	
	// 워케이션 신청 목록 조
	@GetMapping
	public ResponseEntity<Map<String, Object>> selectApprovalList(
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage){
		
		Pageable pageable = PageRequest.of(currentPage - 1, 10);
		
		Page<WorkcationInfo> pageResult = approvalService.selectApprovalList(pageable);
		
		Map<String, Object> map = new HashMap<>();
		map.put("list", pageResult.getContent());
		map.put("currentPage", currentPage);
		map.put("totalPages", pageResult.getTotalPages());
		map.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(map);
		
	}
	

}
