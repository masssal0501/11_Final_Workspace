package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "로그인 응답")
public class LoginResponse {

    @Schema(
        description = "Access Token",
        example = "eyJhbGciOiJIUzI1NiJ9..."
    )
    private String accessToken;

    @Schema(
        description = "직원 번호",
        example = "1001"
    )
    private Integer empNo;

    @Schema(
        description = "직원 로그인 ID",
        example = "hong123"
    )
    private String empId;

    @Schema(
        description = "직원 이름",
        example = "홍길동"
    )
    private String empName;

    @Schema(
        description = "권한 코드",
        example = "EMP"
    )
    private String authCode;

    @Schema(
        description = "부서 코드",
        example = "D01"
    )
    private String depId;

    @Schema(
        description = "직급 코드",
        example = "J01"
    )
    private String jobCode;

    @Schema(
        description = "비밀번호 변경 필요 여부",
        example = "false"
    )
    private Boolean pwChgRequired;
}