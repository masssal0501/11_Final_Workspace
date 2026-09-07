package com.kh.workflow.employee.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.employee.model.dto.ChangePasswordRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateResponse;
import com.kh.workflow.employee.model.dto.EmployeeResponse;
import com.kh.workflow.employee.model.dto.EmployeeUpdateRequest;
import com.kh.workflow.employee.model.dto.LoginRequest;
import com.kh.workflow.employee.model.dto.LoginResponse;
import com.kh.workflow.employee.model.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(
    name = "Employee",
    description = "직원 관리 및 인증 관련 API"
)
public class EmployeeController {

    private final EmployeeService employeeService;


    // USR-001
    @Operation(
        summary = "직원 등록",
        description = "새로운 직원을 등록합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "직원 등록 성공",
            content = @Content(
                schema = @Schema(implementation = EmployeeCreateResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "이미 존재하는 직원 ID"
        )
    })
    @PostMapping
    public ResponseEntity<EmployeeCreateResponse> createEmployee(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "직원 등록 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = EmployeeCreateRequest.class)
            )
        )
        @RequestBody EmployeeCreateRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employeeService.createEmployee(request));
    }


    // 아이디 중복 검사
    @Operation(
        summary = "직원 ID 중복 검사",
        description = "입력한 직원 ID가 이미 사용 중인지 확인합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "중복 여부 조회 성공",
            content = @Content(
                schema = @Schema(
                    type = "boolean",
                    example = "false"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "직원 ID가 입력되지 않음"
        )
    })
    @GetMapping("/checkId")
    public ResponseEntity<Boolean> checkEmpId(
        @Parameter(
            description = "중복 확인할 직원 ID",
            required = true,
            example = "hong123"
        )
        @RequestParam String empId
    ) {

        boolean duplicated =
                employeeService.checkEmpIdDuplicate(empId);

        return ResponseEntity.ok(duplicated);
    }


    // USR-002
    @Operation(
        summary = "직원 로그인",
        description = "직원 ID와 비밀번호를 이용하여 로그인합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "로그인 성공",
            content = @Content(
                schema = @Schema(implementation = LoginResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "아이디 또는 비밀번호가 올바르지 않음"
        )
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "로그인 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = LoginRequest.class)
            )
        )
        @RequestBody LoginRequest request
    ) {

        LoginResponse response = employeeService.login(request);

        return ResponseEntity.ok(response);
    }


    // USR-003
    @Operation(
        summary = "로그아웃",
        description = "현재 로그인된 직원의 로그아웃을 처리합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "로그아웃 성공"
        )
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {

        return ResponseEntity.ok().build();
    }


    // USR-004
    @Operation(
        summary = "비밀번호 변경",
        description = "현재 로그인한 직원의 비밀번호를 변경합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "비밀번호 변경 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "현재 비밀번호가 일치하지 않거나 잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "로그인이 필요함"
        )
    })
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "비밀번호 변경 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = ChangePasswordRequest.class)
            )
        )
        @RequestBody ChangePasswordRequest request,
        Authentication authentication
    ) {

        String empId = authentication.getName();

        employeeService.changePassword(
            empId,
            request
        );

        return ResponseEntity.ok(
            Map.of(
                "message",
                "비밀번호가 정상적으로 변경되었습니다."
            )
        );
    }


    // USR-005
    @Operation(
        summary = "직원 상세 조회",
        description = "직원 번호를 기준으로 직원의 상세 정보를 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "직원 조회 성공",
            content = @Content(
                schema = @Schema(implementation = EmployeeResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "해당 직원을 찾을 수 없음"
        )
    })
    @GetMapping("/{empNo}")
    public ResponseEntity<EmployeeResponse> getEmployee(
        @Parameter(
            description = "조회할 직원 번호",
            required = true,
            example = "1001"
        )
        @PathVariable Integer empNo
    ) {

        return ResponseEntity.ok(
            employeeService.getEmployee(empNo)
        );
    }


    // USR-006
    @Operation(
        summary = "직원 정보 수정",
        description = "직원 번호를 기준으로 직원의 기본 정보를 수정합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "직원 정보 수정 성공",
            content = @Content(
                schema = @Schema(implementation = EmployeeResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "해당 직원을 찾을 수 없음"
        )
    })
    @PutMapping("/{empNo}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
        @Parameter(
            description = "수정할 직원 번호",
            required = true,
            example = "1001"
        )
        @PathVariable Integer empNo,

        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "수정할 직원 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = EmployeeUpdateRequest.class)
            )
        )
        @RequestBody EmployeeUpdateRequest request
    ) {

        return ResponseEntity.ok(
            employeeService.updateEmployee(
                empNo,
                request
            )
        );
    }


    // USR-007
    @Operation(
        summary = "직원 상태 변경",
        description = "직원의 재직 상태를 변경합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "직원 상태 변경 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 상태 값"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "해당 직원을 찾을 수 없음"
        )
    })
    @PatchMapping("/{empNo}/status")
    public ResponseEntity<Void> updateStatus(
        @Parameter(
            description = "상태를 변경할 직원 번호",
            required = true,
            example = "1001"
        )
        @PathVariable Integer empNo,

        @Parameter(
            description = "변경할 직원 상태",
            required = true,
            example = "Y"
        )
        @RequestParam String status
    ) {

        employeeService.updateEmployeeStatus(
            empNo,
            status
        );

        return ResponseEntity.noContent().build();
    }


    // USR-008
    @Operation(
        summary = "직원 목록 조회",
        description = "전체 직원 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "직원 목록 조회 성공",
            content = @Content(
                schema = @Schema(
                    type = "array",
                    implementation = EmployeeResponse.class
                )
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getEmployeeList() {

        return ResponseEntity.ok(
            employeeService.getEmployeeList()
        );
    }


    // USR-009
    @Operation(
        summary = "직원 ID 찾기",
        description = "직원 이름과 이메일을 이용하여 직원 ID를 찾습니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "직원 ID 조회 성공",
            content = @Content(
                schema = @Schema(implementation = FindIdResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "일치하는 직원 정보를 찾을 수 없음"
        )
    })
    @PostMapping("/findId")
    public ResponseEntity<FindIdResponse> findEmployeeId(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "직원 ID 찾기 요청 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = FindIdRequest.class)
            )
        )
        @RequestBody FindIdRequest request
    ) {

        FindIdResponse response =
            employeeService.findEmployeeId(request);

        return ResponseEntity.ok(response);
    }


    // USR-011
    @Operation(
        summary = "직원 권한 정보 변경",
        description = "직원의 권한, 부서, 직급 정보를 변경합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "직원 권한 정보 변경 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "해당 직원을 찾을 수 없음"
        )
    })
    @PatchMapping("/{empNo}/role")
    public ResponseEntity<Void> updateRole(
        @Parameter(
            description = "정보를 변경할 직원 번호",
            required = true,
            example = "1001"
        )
        @PathVariable Integer empNo,

        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "변경할 권한/부서/직급 정보",
            required = true,
            content = @Content(
                schema = @Schema(implementation = EmployeeRoleUpdateRequest.class)
            )
        )
        @RequestBody EmployeeRoleUpdateRequest request
    ) {

        employeeService.updateEmployeeRole(
            empNo,
            request
        );

        return ResponseEntity.noContent().build();
    }
}