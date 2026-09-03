package com.kh.workflow.employee.model.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "직원 정보 응답")
public class EmployeeResponse {

    @Schema(
        description = "직원 번호",
        example = "1"
    )
    private Integer empNo;

    @Schema(
        description = "직원 로그인 ID",
        example = "staff01"
    )
    private String empId;

    @Schema(
        description = "직원 이름",
        example = "홍길동"
    )
    private String empName;

    @Schema(
        description = "전화번호",
        example = "010-1234-5678"
    )
    private String phone;

    @Schema(
        description = "이메일",
        example = "hong@example.com"
    )
    private String email;

    @Schema(
        description = "주소",
        example = "서울특별시 중구 세종대로 110"
    )
    private String address;

    @Schema(
        description = "입사일",
        example = "2026-09-01T09:00:00"
    )
    private LocalDateTime joinAt;

    @Schema(
        description = "퇴사일",
        example = "2027-12-31T18:00:00",
        nullable = true
    )
    private LocalDateTime endAt;

    @Schema(
        description = "재직 상태",
        example = "Y",
        allowableValues = {"Y", "N"}
    )
    private String status;

    @Schema(
        description = "비밀번호 변경 필요 여부",
        example = "false"
    )
    private Boolean pwChgRequired;

    @Schema(
        description = "부서 코드",
        example = "D01"
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