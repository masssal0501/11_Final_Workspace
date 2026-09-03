package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "직원 권한 정보 변경 요청")
public class EmployeeRoleUpdateRequest {

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
}