package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "직원 등록 응답")
public class EmployeeCreateResponse {

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
}