package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "직원 ID 찾기 요청")
public class FindIdRequest {

    @Schema(
        description = "직원 이름",
        example = "홍길동"
    )
    private String empName;

    @Schema(
        description = "직원 이메일",
        example = "hong@example.com"
    )
    private String email;
}