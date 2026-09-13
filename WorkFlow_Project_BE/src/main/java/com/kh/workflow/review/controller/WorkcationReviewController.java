package com.kh.workflow.review.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.review.model.service.WorkcationReviewService;
import com.kh.workflow.workcation.model.vo.WorkcationReview;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO-N02: 워케이션 후기 - 만족도 조사(SurveyController)와 별개의 기능.
// "/workcation/**"는 SecurityConfig에서 이미 authenticated()로 보호되므로
// 별도 규칙 추가 없이 로그인한 사용자면 누구나 호출 가능(소유권은 Service에서 검증).
@Tag(name = "워케이션 후기 관리", description = "워케이션 종료 후 작성하는 별점+후기글(+사진) 관련 API")
@RestController
@RequestMapping("/workcation/review")
public class WorkcationReviewController {

    @Autowired
    private WorkcationReviewService reviewService;

    @Autowired
    private EmployeeDao employeeDao;

    @Operation(summary = "후기 작성 가능 여부 조회", description = "본인 소유/승인 완료/종료 여부/기작성 여부를 확인해 후기 작성 가능 여부를 반환합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)")
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/status/{workcationNo}")
    public ResponseEntity<Map<String, Object>> getReviewStatus(
            @Parameter(description = "확인할 워케이션 번호", example = "1", required = true)
            @PathVariable Integer workcationNo,
            Authentication authentication) {

        Employee employee = currentEmployee(authentication);

        return ResponseEntity.ok(reviewService.getReviewStatus(employee.getEmpNo(), workcationNo));
    }

    @Operation(summary = "워케이션 후기 조회", description = "워케이션에 작성된 후기를 조회합니다. 본인(또는 MANAGER/ADMIN)만 조회할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "204", description = "아직 작성된 후기가 없음"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/{workcationNo}")
    public ResponseEntity<WorkcationReview> getReview(
            @Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
            @PathVariable Integer workcationNo,
            Authentication authentication) {

        Employee loginEmployee = currentEmployee(authentication);

        WorkcationReview review = reviewService.getReview(workcationNo);

        if (review == null) {
            return ResponseEntity.noContent().build();
        }

        if (!canAccessReview(review, loginEmployee)) {
            throw new AccessDeniedException("해당 후기에 접근할 권한이 없습니다.");
        }

        return ResponseEntity.ok(review);
    }

    @Operation(summary = "내 후기 목록 조회", description = "로그인한 본인이 작성한 후기 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)")
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/my")
    public ResponseEntity<List<WorkcationReview>> getMyReviews(Authentication authentication) {

        Employee employee = currentEmployee(authentication);

        return ResponseEntity.ok(reviewService.getMyReviews(employee.getEmpNo()));
    }

    @Operation(summary = "워케이션 후기 작성", description = "본인이 다녀온 워케이션에 대한 별점+후기글(+사진)을 제출합니다. 워케이션당 1회만 작성할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "작성 성공"),
        @ApiResponse(responseCode = "400", description = "작성 조건 미충족(본인 소유 아님/미승인/미종료/기작성) 또는 잘못된 입력"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)")
    })
    @SecurityRequirement(name = "JWT")
    @PostMapping
    public ResponseEntity<WorkcationReview> submitReview(
            @Parameter(description = "워케이션 번호", example = "1", required = true)
            @RequestParam Integer workcationNo,
            @Parameter(description = "별점(1~5)", example = "5", required = true)
            @RequestParam Integer rating,
            @Parameter(description = "후기 내용", required = true)
            @RequestParam String content,
            @Parameter(description = "후기 사진(선택, jpg/jpeg/png/gif/webp, 최대 10MB)")
            @RequestParam(required = false) MultipartFile photo,
            Authentication authentication) {

        Employee employee = currentEmployee(authentication);

        WorkcationReview review = reviewService.submitReview(
                employee.getEmpNo(), workcationNo, rating, content, photo);

        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    private Employee currentEmployee(Authentication authentication) {
        return employeeDao.findByEmpId(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
    }

    // 조회 권한 - 본인, 같은 부서 MANAGER, ADMIN
    private boolean canAccessReview(WorkcationReview review, Employee loginEmployee) {

        String authCode = loginEmployee.getAuthCode();

        if ("ADMIN".equals(authCode)) {
            return true;
        }

        Employee owner = review.getEmployee();

        if (owner == null) {
            return false;
        }

        if ("MANAGER".equals(authCode)) {
            return owner.getDepId() != null && owner.getDepId().equals(loginEmployee.getDepId());
        }

        return owner.getEmpNo() != null && owner.getEmpNo().equals(loginEmployee.getEmpNo());
    }
}
