package com.kh.workflow.task.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.task.model.service.TaskService;

@RestController
@RequestMapping("/task")
public class TaskController {

	@Autowired
	private TaskService taskService;

	// 목록
	@GetMapping("/list")
	public ResponseEntity<?> selectTaskList(@RequestParam(value = "cpage", defaultValue = "1") int cpage,
			@RequestParam(value = "condition", defaultValue = "all") String condition,
			@RequestParam(value = "keyword", defaultValue = "") String keyword) {

		Pageable pageable = PageRequest.of(cpage - 1, 10);

		Page<Map<String, Object>> result = taskService.selectTaskBoardList(keyword, pageable);

		return ResponseEntity.ok(result);
	}

	// 상세
	@GetMapping("/detail/{taskNo}")
	public ResponseEntity<?> selectTaskDetail(@PathVariable Integer taskNo) {
		return ResponseEntity.ok(taskService.selectTaskDetail(taskNo));
	}

	@GetMapping("/workcation/{workcationNo}")
	public ResponseEntity<?> selectWorkcationTasks(@PathVariable Integer workcationNo) {

		return ResponseEntity.ok(taskService.selectWorkcationTasks(workcationNo));
	}

	@PatchMapping("/{taskNo}/status")
	public ResponseEntity<?> updateTaskStatus(@PathVariable Integer taskNo, @RequestBody Map<String, String> data) {

		taskService.updateTaskStatus(taskNo, data.get("status"), data.get("content"));

		return ResponseEntity.ok("상태 변경 완료");
	}
}