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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "만족도조사 관리", description = "워케이션 만족도 조사 질문 조회, 작성 가능 여부 확인, 제출 관련 API")
@RestController
@RequestMapping("/survey")
public class SurveyController {

	@Autowired
	private SurveyService surveyService;

	@Autowired
	private EmployeeDao employeeDao;

	@Operation(summary = "만족도 조사 질문 목록 조회", description = "만족도 조사에 사용되는 전체 질문 목록을 조회합니다. 워케이션 종료 후 만족도 조사 화면에 표시할 질문지를 구성할 때 사용합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)")
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/questions")
	public ResponseEntity<List<SurveyQuestion>> getQuestions() {
		return ResponseEntity.ok(surveyService.getQuestions());
	}

	@Operation(summary = "만족도 조사 작성 가능 여부 조회", description = "요청한 워케이션이 본인 것인지, 승인이 완료됐는지, 종료됐는지, 이미 조사를 작성했는지를 확인해 만족도 조사 작성 가능 여부를 반환합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)"),
		@ApiResponse(responseCode = "400", description = "사용자 정보를 찾을 수 없는 경우"),
		@ApiResponse(responseCode = "500", description = "서버 오류")
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/status/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getSurveyStatus(
			@Parameter(description = "만족도 조사 작성 가능 여부를 확인할 워케이션 번호", example = "1", required = true)
			@PathVariable Integer workcationNo,
			Authentication authentication) {

		Employee employee = employeeDao.findByEmpId(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

		return ResponseEntity.ok(surveyService.getSurveyStatus(employee.getEmpNo(), workcationNo));
	}

	@Operation(summary = "만족도 조사 제출", description = "본인이 다녀온 워케이션에 대한 만족도 조사 답변(문항별 응답)을 제출합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "제출 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)"),
		@ApiResponse(responseCode = "400", description = "사용자 정보를 찾을 수 없는 경우"),
		@ApiResponse(responseCode = "500", description = "서버 오류")
	})
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
