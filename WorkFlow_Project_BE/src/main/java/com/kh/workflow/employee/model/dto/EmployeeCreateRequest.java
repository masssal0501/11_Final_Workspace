package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "직원 등록 요청")
public class EmployeeCreateRequest {

    @Schema(
        description = "직원 로그인 ID",
        example = "hong123",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String empId;

    @Schema(
        description = "직원 이름",
        example = "홍길동",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String empName;

    @Schema(
        description = "전화번호",
        example = "010-1234-5678",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String phone;

    @Schema(
        description = "이메일",
        example = "hong@example.com",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @Schema(
        description = "주소",
        example = "서울특별시 중구 세종대로 110"
    )
    private String address;

    @Schema(
        description = "부서 코드",
        example = "D01",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String depId;

    @Schema(
        description = "권한 코드",
        example = "EMP"
    )
    private String authCode;

    @Schema(
        description = "직급 코드",
        example = "J01"
    )
    private String jobCode;
}