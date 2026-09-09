package com.kh.workflow.survey.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.survey.model.dto.SurveySubmitRequest;
import com.kh.workflow.survey.model.service.SurveyService;
import com.kh.workflow.workcation.model.vo.SurveyQuestion;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Survey API", description = "워케이션 만족도 조사 관련 API")
@RestController
@RequestMapping("/survey")
public class SurveyController {

	@Autowired
	private SurveyService surveyService;

	@Autowired
	private EmployeeDao employeeDao;

	@Operation(summary = "만족도 조사 질문 목록 조회")
	@GetMapping("/questions")
	public ResponseEntity<List<SurveyQuestion>> getQuestions() {
		return ResponseEntity.ok(surveyService.getQuestions());
	}

	@Operation(summary = "만족도 조사 작성 가능 여부 조회", description = "본인 워케이션 여부, 승인 상태, 종료 여부, 기작성 여부를 확인합니다.")
	@SecurityRequirement(name = "JWT")
	@GetMapping("/status/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getSurveyStatus(@PathVariable Integer workcationNo,
			Authentication authentication) {

		Employee employee = employeeDao.findByEmpId(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

		return ResponseEntity.ok(surveyService.getSurveyStatus(employee.getEmpNo(), workcationNo));
	}

	@Operation(summary = "만족도 조사 제출")
	@SecurityRequirement(name = "JWT")
	@PostMapping
	public ResponseEntity<Void> submitSurvey(@RequestBody SurveySubmitRequest request,
			Authentication authentication) {

		Employee employee = employeeDao.findByEmpId(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

		surveyService.submitSurvey(employee.getEmpNo(), request.workcationNo, request.answers);

		return ResponseEntity.ok().build();
	}
}
